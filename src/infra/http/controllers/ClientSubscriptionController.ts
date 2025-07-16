import { SubscribeToPlanUseCase } from '@/core/application/use-cases/SubscribeToPlanUseCase';
import { CancelClientSubscriptionUseCase } from '@/core/application/use-cases/CancelClientSubscriptionUseCase';
import { ResourceNotFoundError } from '@/core/application/use-cases/errors/ResourceNotFoundError';
import { NotAuthorizedError } from '@/core/application/use-cases/errors/NotAuthorizedError';
import { SubscriptionFailedError } from '@/core/application/use-cases/errors/SubscriptionFailedError';

interface SubscribeData {
  planId: string;
  clientId: string;
}

interface ControllerResponse {
  status: number;
  data: any; // Ajustar para o tipo de dado real ou unknown
}

export class ClientSubscriptionController {
  constructor(
    private subscribeToPlanUseCase: SubscribeToPlanUseCase,
    private cancelClientSubscriptionUseCase: CancelClientSubscriptionUseCase,
  ) {}

  async subscribe(data: SubscribeData): Promise<ControllerResponse> {
    try {
      // O Use Case já está disponível via construtor
      const newSubscription = await this.subscribeToPlanUseCase.execute({
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

  async cancel(subscriptionId: string, clientId: string): Promise<ControllerResponse> {
    try {
      await this.cancelClientSubscriptionUseCase.execute({
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
