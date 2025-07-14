import { ClientSubscriptionPlan, PlanCredits } from '@/core/domain/entities/ClientSubscriptionPlan';
import { IClientSubscriptionPlanRepository } from '@/core/domain/repositories/IClientSubscriptionPlanRepository';

interface CreateClientSubscriptionPlanUseCaseRequest {
  name: string;
  price: number;
  credits: PlanCredits;
  petShopId: string;
}

type CreateClientSubscriptionPlanUseCaseResponse = ClientSubscriptionPlan;

export class CreateClientSubscriptionPlanUseCase {
  constructor(private readonly planRepository: IClientSubscriptionPlanRepository) {}

  async execute({
    name,
    price,
    credits,
    petShopId,
  }: CreateClientSubscriptionPlanUseCaseRequest): Promise<CreateClientSubscriptionPlanUseCaseResponse> {
    const plan = await this.planRepository.create({
      name,
      price,
      credits,
      petShopId,
    });

    return plan;
  }
}
