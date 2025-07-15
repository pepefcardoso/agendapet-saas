import { IClientSubscriptionRepository } from '@/core/domain/repositories/IClientSubscriptionRepository';
import { ClientSubscription, Prisma, SubscriptionStatus } from '@prisma/client';
import { prisma } from '../client';

type CreditDataInput = Omit<Prisma.ClientSubscriptionCreditUncheckedCreateInput, 'subscriptionId'>;

export class PrismaClientSubscriptionRepository implements IClientSubscriptionRepository {
  async findActiveByClientAndPlan(
    clientId: string,
    planId: string,
  ): Promise<ClientSubscription | null> {
    const subscription = await prisma.clientSubscription.findFirst({
      where: {
        clientId,
        planId,
        status: 'ACTIVE',
      },
    });
    return subscription;
  }

  async createWithCredits(
    subscriptionData: Prisma.ClientSubscriptionUncheckedCreateInput,
    creditsData: CreditDataInput[],
  ): Promise<ClientSubscription> {
    const result = await prisma.$transaction(async (tx) => {
      const newSubscription = await tx.clientSubscription.create({
        data: subscriptionData,
      });

      const creditsToCreate = creditsData.map((credit) => ({
        ...credit,
        subscriptionId: newSubscription.id,
      }));

      await tx.clientSubscriptionCredit.createMany({
        data: creditsToCreate,
      });

      return newSubscription;
    });

    return result;
  }

  async create(subscription: ClientSubscription): Promise<ClientSubscription> {
    return await prisma.clientSubscription.create({ data: subscription });
  }

  async findByPlanAndClient(
    planId: string,
    clientId: string,
    status: SubscriptionStatus = 'ACTIVE',
  ): Promise<ClientSubscription | null> {
    return await prisma.clientSubscription.findFirst({
      where: { planId, clientId, status },
    });
  }

  async findById(id: string): Promise<ClientSubscription | null> {
    return await prisma.clientSubscription.findUnique({ where: { id } });
  }

  async save(subscription: ClientSubscription): Promise<ClientSubscription> {
    return await prisma.clientSubscription.update({
      where: { id: subscription.id },
      data: subscription,
    });
  }
}
