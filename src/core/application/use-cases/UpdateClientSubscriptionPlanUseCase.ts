import { ClientSubscriptionPlan, PlanCredits } from '@/core/domain/entities/ClientSubscriptionPlan';
import { IClientSubscriptionPlanRepository } from '@/core/domain/repositories/IClientSubscriptionPlanRepository';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';

interface UpdateClientSubscriptionPlanUseCaseRequest {
  planId: string;
  petShopId: string;
  data: {
    name?: string;
    price?: number;
    credits?: PlanCredits;
  };
}

type UpdateClientSubscriptionPlanUseCaseResponse = ClientSubscriptionPlan;

export class UpdateClientSubscriptionPlanUseCase {
  constructor(private readonly planRepository: IClientSubscriptionPlanRepository) {}

  async execute({
    planId,
    petShopId,
    data,
  }: UpdateClientSubscriptionPlanUseCaseRequest): Promise<UpdateClientSubscriptionPlanUseCaseResponse> {
    const plan = await this.planRepository.findUniqueByPetShopAndId(petShopId, planId);

    if (!plan) {
      throw new ResourceNotFoundError();
    }

    Object.assign(plan, data);

    await this.planRepository.save(plan);

    return plan;
  }
}
