import { Appointment, Service } from '@prisma/client';
import { IAppointmentRepository } from '@/core/domain/repositories/IAppointmentRepository';
import { IPetShopRepository } from '@/core/domain/repositories/IPetShopRepository';
import { IServiceRepository } from '@/core/domain/repositories/IServiceRepository';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';
import { AppointmentOutsideWorkingHoursError } from './errors/AppointmentOutsideWorkingHoursError';
import { ScheduleConflictError } from './errors/ScheduleConflictError';
import {
  setHours,
  setMinutes,
  isWithinInterval,
  addMinutes,
  setSeconds,
  setMilliseconds,
} from 'date-fns';

interface IWorkingHours {
  [dayOfWeek: number]: Array<{ start: string; end: string }>;
}

interface ICreateAppointmentUseCaseRequest {
  clientId: string;
  petShopId: string;
  petId: string;
  serviceIds: string[];
  startTime: Date;
}

interface ICreateAppointmentUseCaseResponse {
  appointment: Appointment;
}

export class CreateAppointmentUseCase {
  constructor(
    private appointmentRepository: IAppointmentRepository,
    private petShopRepository: IPetShopRepository,
    private serviceRepository: IServiceRepository,
  ) {}

  async execute({
    clientId,
    petShopId,
    petId,
    serviceIds,
    startTime,
  }: ICreateAppointmentUseCaseRequest): Promise<ICreateAppointmentUseCaseResponse> {
    const petShop = await this.petShopRepository.findById(petShopId);
    if (!petShop) {
      throw new ResourceNotFoundError();
    }

    const services = await Promise.all(serviceIds.map((id) => this.serviceRepository.findById(id)));

    const foundServices = services.filter((s): s is Service => s !== null);
    if (foundServices.length !== serviceIds.length) {
      throw new ResourceNotFoundError();
    }

    const totalDuration = foundServices.reduce((sum, service) => sum + service.duration, 0);
    const endTime = addMinutes(startTime, totalDuration);

    const workingHours = petShop.workingHours as IWorkingHours | null;
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

    const appointmentsOnDate = await this.appointmentRepository.findManyByPetShopIdOnDate(
      petShopId,
      startTime,
    );

    for (const existingAppointment of appointmentsOnDate) {
      const existingDuration = existingAppointment.services.reduce(
        (sum: number, service: Service) => sum + service.duration,
        0,
      );
      const existingEndTime = addMinutes(existingAppointment.date, existingDuration);

      const hasConflict = startTime < existingEndTime && endTime > existingAppointment.date;

      if (hasConflict) {
        throw new ScheduleConflictError();
      }
    }

    const appointment = await this.appointmentRepository.create({
      clientId,
      petShopId,
      petId,
      serviceIds,
      date: startTime,
      status: 'PENDING',
      paymentType: 'MONETARY',
    });

    return {
      appointment,
    };
  }
}
