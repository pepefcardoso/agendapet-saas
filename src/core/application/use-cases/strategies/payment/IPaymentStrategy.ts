import { Appointment, Prisma, Service } from '@prisma/client';

/**
 * Contexto passado para a estratégia de pagamento.
 */
export interface PaymentStrategyContext {
  tx: Prisma.TransactionClient;
  services: Service[];
  loyaltyPromotionId?: string | null; // Adicionado para passar o ID da promoção
}

/**
 * Interface para as Estratégias de Pagamento.
 */
export interface IPaymentStrategy {
  process(appointment: Appointment, context: PaymentStrategyContext): Promise<void>;
}
