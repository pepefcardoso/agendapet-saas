import { Appointment } from '@prisma/client';
import { IPaymentStrategy, PaymentStrategyContext } from './IPaymentStrategy';
import { IClientLoyaltyPointsRepository } from '@/core/domain/repositories/IClientLoyaltyPointsRepository';
import { ILoyaltyPromotionRepository } from '@/core/domain/repositories/ILoyaltyPromotionRepository';
import { ResourceNotFoundError } from '../../errors/ResourceNotFoundError';
import { InsufficientPointsError } from '../../errors/InsufficientPointsError';

/**
 * Estratégia para processar pagamentos de agendamentos com pontos de fidelidade.
 */
export class LoyaltyCreditPaymentStrategy implements IPaymentStrategy {
  constructor(
    private clientLoyaltyPointsRepository: IClientLoyaltyPointsRepository,
    private loyaltyPromotionRepository: ILoyaltyPromotionRepository,
  ) {}

  async process(appointment: Appointment, context: PaymentStrategyContext): Promise<void> {
    const { tx, loyaltyPromotionId } = context;
    const { clientId, petShopId } = appointment;

    if (!loyaltyPromotionId) {
      throw new Error('Loyalty Promotion ID is required for this payment type.');
    }

    const promotion = await this.loyaltyPromotionRepository.findById(loyaltyPromotionId, tx);
    if (!promotion) throw new ResourceNotFoundError('Loyalty promotion not found.');

    const clientPoints = await this.clientLoyaltyPointsRepository.findByClientIdAndPetShopId(
      clientId,
      petShopId,
      tx,
    );

    if (!clientPoints || clientPoints.points < promotion.pointsNeeded) {
      throw new InsufficientPointsError();
    }

    await this.clientLoyaltyPointsRepository.debit(
      { clientId, petShopId, points: promotion.pointsNeeded },
      tx,
    );
  }
}
