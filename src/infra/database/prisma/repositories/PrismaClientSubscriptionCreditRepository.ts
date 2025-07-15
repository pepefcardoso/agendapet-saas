import { IClientSubscriptionCreditRepository } from '@/core/domain/repositories/IClientSubscriptionCreditRepository';
import { prisma } from '@/infra/database/prisma/client';
import { ClientSubscriptionCredit, PrismaClient } from '@prisma/client';

type PrismaTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>;

export class PrismaClientSubscriptionCreditRepository
  implements IClientSubscriptionCreditRepository
{
  async createMany(credits: any[]): Promise<void> {
    await prisma.clientSubscriptionCredit.createMany({
      data: credits,
    });
  }

  async findByClientAndService(
    clientId: string,
    serviceId: string,
    tx?: PrismaTransactionClient,
  ): Promise<ClientSubscriptionCredit | null> {
    const db = tx || prisma;
    return await db.clientSubscriptionCredit.findFirst({
      where: {
        serviceId,
        subscription: {
          clientId,
          status: 'ACTIVE',
        },
      },
    });
  }

  async debit(creditId: string, amount: number, tx?: PrismaTransactionClient): Promise<void> {
    const db = tx || prisma;
    await db.clientSubscriptionCredit.update({
      where: { id: creditId },
      data: {
        remainingCredits: {
          decrement: amount,
        },
      },
    });
  }
}
