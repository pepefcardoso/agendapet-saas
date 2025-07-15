import { IClientSubscriptionPlanRepository } from '@/core/domain/repositories/IClientSubscriptionPlanRepository';
import { IUseCase } from './IUseCase';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';

interface IDeactivateClientSubscriptionPlanRequestDTO {
  planId: string;
  petShopId: string;
}

export class DeactivateClientSubscriptionPlanUseCase
  implements IUseCase<IDeactivateClientSubscriptionPlanRequestDTO, void>
{
  constructor(private clientSubscriptionPlanRepository: IClientSubscriptionPlanRepository) {}

  async execute({ planId, petShopId }: IDeactivateClientSubscriptionPlanRequestDTO): Promise<void> {
    const plan = await this.clientSubscriptionPlanRepository.findById(planId);

    if (!plan) {
      throw new ResourceNotFoundError();
    }

    if (plan.petShopId !== petShopId) {
      throw new Error('Acesso negado.');
    }

    plan.isActive = false;

    await this.clientSubscriptionPlanRepository.save(plan);
  }
}
