import { Appointment, Prisma, Service } from '@prisma/client';

/**
 * Contexto passado para a estratégia de pagamento.
 * @param tx - Uma instância do Prisma Transaction Client para garantir atomicidade.
 * @param services - A lista de serviços completos do agendamento.
 */
export interface PaymentStrategyContext {
  tx: Prisma.TransactionClient;
  services: Service[];
}

/**
 * Interface para as Estratégias de Pagamento.
 * Cada estratégia implementará a lógica para um PaymentType específico.
 */
export interface IPaymentStrategy {
  process(appointment: Appointment, context: PaymentStrategyContext): Promise<void>;
}
