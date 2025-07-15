import { ILoyaltyPlanRepository } from '@/core/domain/repositories/ILoyaltyPlanRepository';
import { ILoyaltyPromotionRepository } from '@/core/domain/repositories/ILoyaltyPromotionRepository';
import { LoyaltyPromotion } from '@prisma/client';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';

interface CreateLoyaltyPromotionUseCaseRequest {
  petShopId: string;
  description: string;
  pointsNeeded: number;
  serviceCredits: { serviceId: string; quantity: number }[];
}

interface CreateLoyaltyPromotionUseCaseResponse {
  promotion: LoyaltyPromotion;
}

export class CreateLoyaltyPromotionUseCase {
  constructor(
    private loyaltyPlanRepository: ILoyaltyPlanRepository,
    private loyaltyPromotionRepository: ILoyaltyPromotionRepository,
  ) {}

  async execute({
    petShopId,
    description,
    pointsNeeded,
    serviceCredits,
  }: CreateLoyaltyPromotionUseCaseRequest): Promise<CreateLoyaltyPromotionUseCaseResponse> {
    const loyaltyPlan = await this.loyaltyPlanRepository.findByPetShopId(petShopId);

    if (!loyaltyPlan) {
      throw new ResourceNotFoundError('Plano de fidelidade não encontrado para este petshop.');
    }

    const promotion = await this.loyaltyPromotionRepository.create({
      loyaltyPlanId: loyaltyPlan.id,
      description,
      pointsNeeded,
      serviceCredits,
    });

    return { promotion };
  }
}
