import { ILoyaltyPlanRepository } from '@/core/domain/repositories/ILoyaltyPlanRepository';
import { ILoyaltyPromotionRepository } from '@/core/domain/repositories/ILoyaltyPromotionRepository';
import { LoyaltyPromotion } from '@prisma/client';

interface ListLoyaltyPromotionsUseCaseRequest {
  petShopId: string;
}

interface ListLoyaltyPromotionsUseCaseResponse {
  promotions: LoyaltyPromotion[];
}

export class ListLoyaltyPromotionsUseCase {
  constructor(
    private loyaltyPlanRepository: ILoyaltyPlanRepository,
    private loyaltyPromotionRepository: ILoyaltyPromotionRepository,
  ) {}

  async execute({
    petShopId,
  }: ListLoyaltyPromotionsUseCaseRequest): Promise<ListLoyaltyPromotionsUseCaseResponse> {
    const loyaltyPlan = await this.loyaltyPlanRepository.findByPetShopId(petShopId);

    if (!loyaltyPlan) {
      return { promotions: [] };
    }

    const promotions = await this.loyaltyPromotionRepository.listByLoyaltyPlanId(loyaltyPlan.id);

    return { promotions };
  }
}
