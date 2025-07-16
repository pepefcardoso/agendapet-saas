import { IAppointmentRepository } from '@/core/domain/repositories/IAppointmentRepository';
import { IClientLoyaltyPointsRepository } from '@/core/domain/repositories/IClientLoyaltyPointsRepository';
import { ILoyaltyPlanRepository } from '@/core/domain/repositories/ILoyaltyPlanRepository';
import { IPaymentsRepository } from '@/core/domain/repositories/IPaymentsRepository';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';

interface IRequest {
  appointmentId: string;
}

/**
 * Caso de uso para creditar pontos de fidelidade após um pagamento monetário.
 */
export class CreditPointsOnPaymentSuccessUseCase {
  constructor(
    private appointmentRepository: IAppointmentRepository,
    private paymentsRepository: IPaymentsRepository,
    private loyaltyPlanRepository: ILoyaltyPlanRepository,
    private clientLoyaltyPointsRepository: IClientLoyaltyPointsRepository,
  ) {}

  async execute({ appointmentId }: IRequest): Promise<void> {
    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) throw new ResourceNotFoundError('Appointment not found.');

    if (appointment.paymentType !== 'MONETARY') return;

    const payment = await this.paymentsRepository.findByAppointmentId(appointmentId);
    if (!payment || payment.status !== 'SUCCEEDED') return;

    const loyaltyPlan = await this.loyaltyPlanRepository.findByPetShopId(appointment.petShopId);
    if (!loyaltyPlan || loyaltyPlan.pointsPerReal <= 0) return;

    const pointsToCredit = Math.floor(payment.amount.toNumber() * loyaltyPlan.pointsPerReal);

    if (pointsToCredit > 0) {
      await this.clientLoyaltyPointsRepository.credit({
        clientId: appointment.clientId,
        petShopId: appointment.petShopId,
        points: pointsToCredit,
      });
    }
  }
}
