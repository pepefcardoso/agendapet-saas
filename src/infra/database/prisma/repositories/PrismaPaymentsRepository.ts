import { IPaymentsRepository } from '@/core/domain/repositories/IPaymentsRepository';
import { Payment } from '@prisma/client';
import { prisma } from '../client';

export class PrismaPaymentsRepository implements IPaymentsRepository {
  async findByAppointmentId(appointmentId: string): Promise<Payment | null> {
    return prisma.payment.findUnique({ where: { appointmentId } });
  }
}
