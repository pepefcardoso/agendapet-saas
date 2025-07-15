import { ILoyaltyPlanRepository } from '@/core/domain/repositories/ILoyaltyPlanRepository';
import { LoyaltyPlan } from '@prisma/client';

interface CreateOrUpdateLoyaltyPlanUseCaseRequest {
  petShopId: string;
  pointsPerReal: number;
}

interface CreateOrUpdateLoyaltyPlanUseCaseResponse {
  loyaltyPlan: LoyaltyPlan;
}

export class CreateOrUpdateLoyaltyPlanUseCase {
  constructor(private loyaltyPlanRepository: ILoyaltyPlanRepository) {}

  async execute({
    petShopId,
    pointsPerReal,
  }: CreateOrUpdateLoyaltyPlanUseCaseRequest): Promise<CreateOrUpdateLoyaltyPlanUseCaseResponse> {
    const loyaltyPlan = await this.loyaltyPlanRepository.upsert({
      petShopId,
      pointsPerReal,
    });

    return { loyaltyPlan };
  }
}
