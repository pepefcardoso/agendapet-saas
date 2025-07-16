import { Payment } from '@prisma/client';

/**
 * Interface para o repositório de pagamentos.
 */
export interface IPaymentsRepository {
  findByAppointmentId(appointmentId: string): Promise<Payment | null>;
}
