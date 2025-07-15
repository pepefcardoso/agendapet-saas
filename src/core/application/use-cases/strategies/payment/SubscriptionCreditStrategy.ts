import { IClientSubscriptionCreditRepository } from '@/core/domain/repositories/IClientSubscriptionCreditRepository';
import { IPaymentStrategy, PaymentStrategyContext } from './IPaymentStrategy';
import { Appointment } from '@prisma/client';
import { InsufficientCreditsError } from '../../errors/InsufficientCreditsError';

export class SubscriptionCreditStrategy implements IPaymentStrategy {
  constructor(private creditRepository: IClientSubscriptionCreditRepository) {}

  async process(appointment: Appointment, context: PaymentStrategyContext): Promise<void> {
    for (const service of context.services) {
      const credit = await this.creditRepository.findByClientAndService(
        appointment.clientId,
        service.id,
        context.tx,
      );

      if (!credit || credit.remainingCredits < 1) {
        throw new InsufficientCreditsError(`Insufficient credits for service: ${service.name}`);
      }

      await this.creditRepository.debit(credit.id, 1, context.tx);
    }
  }
}
