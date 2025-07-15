import { ClientSubscriptionCredit, PrismaClient } from '@prisma/client';

type PrismaTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>;

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

  debit(
    creditId: string,
    amount: number,
    tx?: PrismaTransactionClient, // Parâmetro opcional para transações
  ): Promise<void>;
}
