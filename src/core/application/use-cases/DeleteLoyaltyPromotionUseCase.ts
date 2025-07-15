import { ILoyaltyPromotionRepository } from '@/core/domain/repositories/ILoyaltyPromotionRepository';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';
import { NotAllowedError } from './errors/NotAllowedError';

interface DeleteLoyaltyPromotionUseCaseRequest {
  petShopId: string;
  promotionId: string;
}

export class DeleteLoyaltyPromotionUseCase {
  constructor(private loyaltyPromotionRepository: ILoyaltyPromotionRepository) {}

  async execute({ petShopId, promotionId }: DeleteLoyaltyPromotionUseCaseRequest): Promise<void> {
    const promotion = await this.loyaltyPromotionRepository.findById(promotionId);

    if (!promotion) {
      throw new ResourceNotFoundError('Promoção não encontrada.');
    }

    if (promotion.loyaltyPlan.petShopId !== petShopId) {
      throw new NotAllowedError();
    }

    await this.loyaltyPromotionRepository.delete(promotionId);
  }
}
