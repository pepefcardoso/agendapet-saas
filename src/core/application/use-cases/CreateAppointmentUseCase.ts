import { Appointment, PaymentType, Service } from '@prisma/client';
import { IAppointmentRepository } from '@/core/domain/repositories/IAppointmentRepository';
import { IPetShopRepository } from '@/core/domain/repositories/IPetShopRepository';
import { IServiceRepository } from '@/core/domain/repositories/IServiceRepository';
import { IClientSubscriptionCreditRepository } from '@/core/domain/repositories/IClientSubscriptionCreditRepository';
import { IClientLoyaltyPointsRepository } from '@/core/domain/repositories/IClientLoyaltyPointsRepository';
import { ILoyaltyPromotionRepository } from '@/core/domain/repositories/ILoyaltyPromotionRepository';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';
import { AppointmentOutsideWorkingHoursError } from './errors/AppointmentOutsideWorkingHoursError';
import { ScheduleConflictError } from './errors/ScheduleConflictError';
import { InsufficientCreditsError } from './errors/InsufficientCreditsError';
import { InsufficientPointsError } from './errors/InsufficientPointsError';
import { IPaymentStrategy, PaymentStrategyContext } from './strategies/payment/IPaymentStrategy';
import { SubscriptionCreditStrategy } from './strategies/payment/SubscriptionCreditStrategy';
import { prisma } from '@/infra/database/prisma/client';
import {
  addMinutes,
  isWithinInterval,
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
} from 'date-fns';
import { LoyaltyCreditPaymentStrategy } from './strategies/payment/LoyaltyCreditPaymentStrategy';
import { PrismaTransactionClient } from '@/infra/database/prisma/types';

interface IWorkingHours {
  [dayOfWeek: number]: Array<{ start: string; end: string }>;
}

interface ICreateAppointmentUseCaseRequest {
  clientId: string;
  petShopId: string;
  petId: string;
  serviceIds: string[];
  startTime: Date;
  paymentType: PaymentType;
  loyaltyPromotionId?: string | null;
}

interface ICreateAppointmentUseCaseResponse {
  appointment: Appointment;
}

export class CreateAppointmentUseCase {
  private paymentStrategies: Map<PaymentType, IPaymentStrategy>;

  constructor(
    private appointmentRepository: IAppointmentRepository,
    private petShopRepository: IPetShopRepository,
    private serviceRepository: IServiceRepository,
    clientCreditRepository: IClientSubscriptionCreditRepository,
    clientLoyaltyPointsRepository: IClientLoyaltyPointsRepository,
    loyaltyPromotionRepository: ILoyaltyPromotionRepository,
  ) {
    this.paymentStrategies = new Map();

    this.paymentStrategies.set(
      'SUBSCRIPTION_CREDIT',
      new SubscriptionCreditStrategy(clientCreditRepository),
    );

    this.paymentStrategies.set(
      'LOYALTY_CREDIT',
      new LoyaltyCreditPaymentStrategy(clientLoyaltyPointsRepository, loyaltyPromotionRepository),
    );
  }

  async execute({
    clientId,
    petShopId,
    petId,
    serviceIds,
    startTime,
    paymentType,
    loyaltyPromotionId,
  }: ICreateAppointmentUseCaseRequest): Promise<ICreateAppointmentUseCaseResponse> {
    const petShop = await this.petShopRepository.findById(petShopId);
    if (!petShop) throw new ResourceNotFoundError('Pet shop not found.');

    const services = await this.serviceRepository.findByIds(serviceIds);
    if (services.length !== serviceIds.length)
      throw new ResourceNotFoundError('One or more services not found.');

    this.validateWorkingHours(startTime, services, petShop.workingHours as IWorkingHours | null);
    await this.validateScheduleConflict(petShopId, startTime, services);

    try {
      const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
      const endTime = addMinutes(startTime, totalDuration);

      const appointment = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
        const newAppointment = await this.appointmentRepository.create(
          { clientId, petShopId, petId, date: startTime, endTime, paymentType, serviceIds },
          tx,
        );

        const paymentStrategy = this.paymentStrategies.get(paymentType);
        if (paymentStrategy) {
          const context: PaymentStrategyContext = { tx, services, loyaltyPromotionId };
          await paymentStrategy.process(newAppointment, context);
        }

        newAppointment.status = 'CONFIRMED';
        return this.appointmentRepository.save(newAppointment, tx);
      });

      return { appointment };
    } catch (error) {
      if (
        error instanceof InsufficientCreditsError ||
        error instanceof InsufficientPointsError ||
        error instanceof ScheduleConflictError ||
        error instanceof ResourceNotFoundError
      ) {
        throw error;
      }
      console.error('Transaction failed in CreateAppointmentUseCase:', error);
      throw new Error('Failed to create appointment due to an unexpected error.');
    }
  }

  private validateWorkingHours(
    startTime: Date,
    services: Service[],
    workingHours: IWorkingHours | null,
  ): void {
    const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);
    const endTime = addMinutes(startTime, totalDuration);
    const dayOfWeek = startTime.getDay();

    if (!workingHours || !workingHours[dayOfWeek]) {
      throw new AppointmentOutsideWorkingHoursError();
    }

    const baseDate = setSeconds(setMilliseconds(startTime, 0), 0);
    const isWithinAnyInterval = workingHours[dayOfWeek].some((interval) => {
      const [startHour, startMinute] = interval.start.split(':').map(Number);
      const [endHour, endMinute] = interval.end.split(':').map(Number);
      const intervalStart = setMinutes(setHours(baseDate, startHour), startMinute);
      const intervalEnd = setMinutes(setHours(baseDate, endHour), endMinute);
      return (
        isWithinInterval(startTime, { start: intervalStart, end: intervalEnd }) &&
        isWithinInterval(addMinutes(endTime, -1), { start: intervalStart, end: intervalEnd })
      );
    });

    if (!isWithinAnyInterval) {
      throw new AppointmentOutsideWorkingHoursError();
    }
  }

  private async validateScheduleConflict(
    petShopId: string,
    startTime: Date,
    services: Service[],
  ): Promise<void> {
    const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);
    const endTime = addMinutes(startTime, totalDuration);

    const appointmentsOnDate = await this.appointmentRepository.findManyByPetShopIdOnDate(
      petShopId,
      startTime,
    );

    for (const existingAppointment of appointmentsOnDate) {
      if (existingAppointment.status === 'CANCELLED') continue;

      const existingDuration = existingAppointment.services.reduce(
        (sum, service) => sum + service.duration,
        0,
      );
      const existingEndTime = addMinutes(existingAppointment.date, existingDuration);

      const hasConflict = startTime < existingEndTime && endTime > existingAppointment.date;

      if (hasConflict) {
        throw new ScheduleConflictError();
      }
    }
  }
}
