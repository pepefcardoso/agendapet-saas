import { ClientSubscription, Prisma } from '@prisma/client';

type CreditDataInput = Omit<Prisma.ClientSubscriptionCreditUncheckedCreateInput, 'subscriptionId'>;

export interface IClientSubscriptionRepository {
  createWithCredits(
    subscriptionData: Prisma.ClientSubscriptionUncheckedCreateInput,
    creditsData: CreditDataInput[],
  ): Promise<ClientSubscription>;

  findActiveByClientAndPlan(clientId: string, planId: string): Promise<ClientSubscription | null>;
}
