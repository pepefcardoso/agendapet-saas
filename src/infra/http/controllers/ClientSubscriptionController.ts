import { SubscribeToPlanUseCase } from '@/core/application/use-cases/SubscribeToPlanUseCase';
import { PrismaClientSubscriptionPlanRepository } from '@/infra/database/prisma/repositories/PrismaClientSubscriptionPlanRepository';
import { PrismaClientSubscriptionRepository } from '@/infra/database/prisma/repositories/PrismaClientSubscriptionRepository';
import { CancelClientSubscriptionUseCase } from '@/core/application/use-cases/CancelClientSubscriptionUseCase';
import { ResourceNotFoundError } from '@/core/application/use-cases/errors/ResourceNotFoundError';
import { NotAuthorizedError } from '@/core/application/use-cases/errors/NotAuthorizedError';
import { SubscriptionFailedError } from '@/core/application/use-cases/errors/SubscriptionFailedError'; // Usando o erro correto do UseCase

interface SubscribeData {
  planId: string;
  clientId: string;
}

export class ClientSubscriptionController {
  async subscribe(data: SubscribeData) {
    const planRepository = new PrismaClientSubscriptionPlanRepository();
    const subscriptionRepository = new PrismaClientSubscriptionRepository();

    const subscribeToPlanUseCase = new SubscribeToPlanUseCase(
      subscriptionRepository,
      planRepository,
    );

    try {
      const newSubscription = await subscribeToPlanUseCase.execute({
        planId: data.planId,
        clientId: data.clientId,
      });

      return { status: 201, data: newSubscription };
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        return { status: 404, data: { message: error.message } };
      }
      if (error instanceof SubscriptionFailedError) {
        return {
          status: 409,
          data: { message: 'Client already has an active subscription to this plan.' },
        };
      }
      throw error;
    }
  }

  async cancel(subscriptionId: string, clientId: string) {
    const subscriptionRepository = new PrismaClientSubscriptionRepository();
    const cancelSubscriptionUseCase = new CancelClientSubscriptionUseCase(subscriptionRepository);

    try {
      await cancelSubscriptionUseCase.execute({
        subscriptionId,
        clientId,
      });
      return { status: 204, data: null };
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        return { status: 404, data: { message: error.message } };
      }
      if (error instanceof NotAuthorizedError) {
        return { status: 403, data: { message: error.message } };
      }
      throw error;
    }
  }
}
