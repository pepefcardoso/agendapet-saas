import { ILoyaltyPromotionRepository } from '@/core/domain/repositories/ILoyaltyPromotionRepository';
import { LoyaltyPromotion } from '@prisma/client';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';
import { NotAllowedError } from './errors/NotAllowedError';

interface UpdateLoyaltyPromotionUseCaseRequest {
  petShopId: string;
  promotionId: string;
  data: {
    description?: string;
    pointsNeeded?: number;
    serviceCredits?: { serviceId: string; quantity: number }[];
  };
}

interface UpdateLoyaltyPromotionUseCaseResponse {
  promotion: LoyaltyPromotion;
}

export class UpdateLoyaltyPromotionUseCase {
  constructor(private loyaltyPromotionRepository: ILoyaltyPromotionRepository) {}

  async execute({
    petShopId,
    promotionId,
    data,
  }: UpdateLoyaltyPromotionUseCaseRequest): Promise<UpdateLoyaltyPromotionUseCaseResponse> {
    const promotion = await this.loyaltyPromotionRepository.findById(promotionId);

    if (!promotion) {
      throw new ResourceNotFoundError('Promoção não encontrada.');
    }

    if (promotion.loyaltyPlan.petShopId !== petShopId) {
      throw new NotAllowedError('Você não tem permissão para editar esta promoção.');
    }

    const updatedPromotion = await this.loyaltyPromotionRepository.update(promotionId, data);

    return { promotion: updatedPromotion };
  }
}
