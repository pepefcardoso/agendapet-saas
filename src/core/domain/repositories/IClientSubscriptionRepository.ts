import { ClientSubscription, Prisma, SubscriptionStatus } from '@prisma/client';

type CreditDataInput = Omit<Prisma.ClientSubscriptionCreditUncheckedCreateInput, 'subscriptionId'>;

export interface IClientSubscriptionRepository {
  createWithCredits(
    subscriptionData: Prisma.ClientSubscriptionUncheckedCreateInput,
    creditsData: CreditDataInput[],
  ): Promise<ClientSubscription>;

  findActiveByClientAndPlan(clientId: string, planId: string): Promise<ClientSubscription | null>;
  create(subscription: ClientSubscription): Promise<ClientSubscription>;
  findByPlanAndClient(
    planId: string,
    clientId: string,
    status?: SubscriptionStatus,
  ): Promise<ClientSubscription | null>;
  findById(id: string): Promise<ClientSubscription | null>;
  save(subscription: ClientSubscription): Promise<ClientSubscription>;
}
