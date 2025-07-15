import { IClientSubscriptionRepository } from '@/core/domain/repositories/IClientSubscriptionRepository';
import { NotAuthorizedError } from './errors/NotAuthorizedError';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';

interface CancelClientSubscriptionUseCaseRequest {
  subscriptionId: string;
  clientId: string;
}

export class CancelClientSubscriptionUseCase {
  constructor(private clientSubscriptionRepository: IClientSubscriptionRepository) {}

  async execute({
    subscriptionId,
    clientId,
  }: CancelClientSubscriptionUseCaseRequest): Promise<void> {
    const subscription = await this.clientSubscriptionRepository.findById(subscriptionId);

    if (!subscription) {
      throw new ResourceNotFoundError();
    }

    if (subscription.clientId !== clientId) {
      throw new NotAuthorizedError();
    }

    subscription.status = 'CANCELLED';
    // Aqui poderíamos adicionar lógica de negócio, como por exemplo:
    // - Manter os créditos válidos até a renewalDate.
    // - Invalidar os créditos imediatamente.

    await this.clientSubscriptionRepository.save(subscription);
  }
}
