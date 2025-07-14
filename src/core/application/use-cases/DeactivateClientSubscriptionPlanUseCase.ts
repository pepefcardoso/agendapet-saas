import { IClientSubscriptionPlanRepository } from '@/core/domain/repositories/IClientSubscriptionPlanRepository';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';

interface DeactivateClientSubscriptionPlanUseCaseRequest {
  planId: string;
  petShopId: string;
}

export class DeactivateClientSubscriptionPlanUseCase {
  constructor(private readonly planRepository: IClientSubscriptionPlanRepository) {}

  async execute({
    planId,
    petShopId,
  }: DeactivateClientSubscriptionPlanUseCaseRequest): Promise<void> {
    const plan = await this.planRepository.findUniqueByPetShopAndId(petShopId, planId);

    if (!plan) {
      throw new ResourceNotFoundError();
    }

    plan.isActive = false;

    await this.planRepository.save(plan);
  }
}
