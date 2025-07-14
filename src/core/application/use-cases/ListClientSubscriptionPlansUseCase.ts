import { ClientSubscriptionPlan } from '@/core/domain/entities/ClientSubscriptionPlan';
import { IClientSubscriptionPlanRepository } from '@/core/domain/repositories/IClientSubscriptionPlanRepository';

interface ListClientSubscriptionPlansUseCaseRequest {
  petShopId: string;
}

type ListClientSubscriptionPlansUseCaseResponse = ClientSubscriptionPlan[];

export class ListClientSubscriptionPlansUseCase {
  constructor(private readonly planRepository: IClientSubscriptionPlanRepository) {}

  async execute({
    petShopId,
  }: ListClientSubscriptionPlansUseCaseRequest): Promise<ListClientSubscriptionPlansUseCaseResponse> {
    const plans = await this.planRepository.findByPetShopId(petShopId);
    return plans;
  }
}
