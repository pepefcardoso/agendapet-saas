import { ClientSubscriptionCredit } from '@prisma/client';
import { PrismaTransactionClient } from '@/infra/database/prisma/types';

export interface IClientSubscriptionCreditRepository {
  createMany(
    credits: Array<{
      subscriptionId: string;
      serviceId: string;
      remainingCredits: number;
    }>,
  ): Promise<void>;

  findByClientAndService(
    clientId: string,
    serviceId: string,
    tx?: PrismaTransactionClient,
  ): Promise<ClientSubscriptionCredit | null>;

  debit(creditId: string, amount: number, tx?: PrismaTransactionClient): Promise<void>;
}
