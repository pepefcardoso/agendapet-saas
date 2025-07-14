import { Prisma } from '@prisma/client';

export interface CreateClientSubscriptionCreditDTO {
  subscriptionId: string;
  serviceId: string;
  remainingCredits: number;
}

export interface IClientSubscriptionCreditRepository {
  createMany(
    credits: CreateClientSubscriptionCreditDTO[],
    transaction?: Prisma.TransactionClient,
  ): Promise<void>;
}
