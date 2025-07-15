import {
  ClientSubscription,
  ClientSubscriptionCredit,
  Prisma,
  SubscriptionStatus,
} from '@prisma/client';
import { IClientSubscriptionRepository } from '../IClientSubscriptionRepository';

type CreditDataInput = Omit<Prisma.ClientSubscriptionCreditUncheckedCreateInput, 'subscriptionId'>;

export class InMemoryClientSubscriptionRepository implements IClientSubscriptionRepository {
  public subscriptions: ClientSubscription[] = [];
  public credits: ClientSubscriptionCredit[] = [];

  async findActiveByClientAndPlan(
    clientId: string,
    planId: string,
  ): Promise<ClientSubscription | null> {
    const sub = this.subscriptions.find(
      (s) => s.clientId === clientId && s.planId === planId && s.status === 'ACTIVE',
    );
    return sub || null;
  }

  async createWithCredits(
    subscriptionData: Prisma.ClientSubscriptionUncheckedCreateInput,
    creditsData: CreditDataInput[],
  ): Promise<ClientSubscription> {
    const newSubscription: ClientSubscription = {
      id: `sub-${this.subscriptions.length + 1}`,
      clientId: subscriptionData.clientId,
      planId: subscriptionData.planId,
      status: subscriptionData.status as SubscriptionStatus,
      renewalDate: new Date(subscriptionData.renewalDate),
    };
    this.subscriptions.push(newSubscription);

    creditsData.forEach((credit) => {
      this.credits.push({
        id: `credit-${this.credits.length + 1}`,
        subscriptionId: newSubscription.id,
        serviceId: credit.serviceId,
        remainingCredits: credit.remainingCredits,
      });
    });

    return newSubscription;
  }
}
