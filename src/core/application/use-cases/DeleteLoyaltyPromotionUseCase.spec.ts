import { InMemoryLoyaltyPlanRepository } from '@/core/domain/repositories/in-memory/InMemoryLoyaltyPlanRepository';
import { InMemoryLoyaltyPromotionRepository } from '@/core/domain/repositories/in-memory/InMemoryLoyaltyPromotionRepository';
import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteLoyaltyPromotionUseCase } from './DeleteLoyaltyPromotionUseCase';
import { NotAllowedError } from './errors/NotAllowedError';

let loyaltyPlanRepository: InMemoryLoyaltyPlanRepository;
let loyaltyPromotionRepository: InMemoryLoyaltyPromotionRepository;
let sut: DeleteLoyaltyPromotionUseCase;

describe('Delete Loyalty Promotion Use Case', () => {
  beforeEach(async () => {
    loyaltyPlanRepository = new InMemoryLoyaltyPlanRepository();
    loyaltyPromotionRepository = new InMemoryLoyaltyPromotionRepository(loyaltyPlanRepository);
    sut = new DeleteLoyaltyPromotionUseCase(loyaltyPromotionRepository);
  });

  it('deve ser capaz de deletar uma promoção', async () => {
    const { id: loyaltyPlanId } = await loyaltyPlanRepository.upsert({
      petShopId: 'petshop-01',
      pointsPerReal: 1,
    });
    const { id: promotionId } = await loyaltyPromotionRepository.create({
      loyaltyPlanId,
      description: 'A ser deletada',
      pointsNeeded: 50,
      serviceCredits: [],
    });

    expect(loyaltyPromotionRepository.items).toHaveLength(1);

    await sut.execute({
      petShopId: 'petshop-01',
      promotionId,
    });

    expect(loyaltyPromotionRepository.items).toHaveLength(0);
  });

  it('não deve ser capaz de deletar uma promoção de outro petshop', async () => {
    const { id: loyaltyPlanId } = await loyaltyPlanRepository.upsert({
      petShopId: 'petshop-01',
      pointsPerReal: 1,
    });
    const { id: promotionId } = await loyaltyPromotionRepository.create({
      loyaltyPlanId,
      description: 'Promoção do Petshop 01',
      pointsNeeded: 100,
      serviceCredits: [],
    });

    await expect(
      sut.execute({
        petShopId: 'petshop-02-intruso',
        promotionId,
      }),
    ).rejects.toBeInstanceOf(NotAllowedError);
  });
});
