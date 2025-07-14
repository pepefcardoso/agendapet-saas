import { ClientSubscription } from '@prisma/client';
import { Prisma } from '@prisma/client'; // Importar Prisma

export interface CreateClientSubscriptionDTO {
  clientId: string;
  planId: string;
  renewalDate: Date;
}

export interface IClientSubscriptionRepository {
  create(
    data: CreateClientSubscriptionDTO,
    transaction?: Prisma.TransactionClient,
  ): Promise<ClientSubscription>;
  findActiveByClientAndPlan(clientId: string, planId: string): Promise<ClientSubscription | null>;
}
