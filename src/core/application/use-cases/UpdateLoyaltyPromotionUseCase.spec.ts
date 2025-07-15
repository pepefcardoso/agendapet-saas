import { InMemoryLoyaltyPlanRepository } from '@/core/domain/repositories/in-memory/InMemoryLoyaltyPlanRepository';
import { InMemoryLoyaltyPromotionRepository } from '@/core/domain/repositories/in-memory/InMemoryLoyaltyPromotionRepository';
import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateLoyaltyPromotionUseCase } from './UpdateLoyaltyPromotionUseCase';
import { NotAllowedError } from './errors/NotAllowedError';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';

let loyaltyPlanRepository: InMemoryLoyaltyPlanRepository;
let loyaltyPromotionRepository: InMemoryLoyaltyPromotionRepository;
let sut: UpdateLoyaltyPromotionUseCase;

describe('Update Loyalty Promotion Use Case', () => {
  beforeEach(async () => {
    loyaltyPlanRepository = new InMemoryLoyaltyPlanRepository();
    loyaltyPromotionRepository = new InMemoryLoyaltyPromotionRepository(loyaltyPlanRepository);
    sut = new UpdateLoyaltyPromotionUseCase(loyaltyPromotionRepository);
  });

  it('deve ser capaz de atualizar uma promoção', async () => {
    const { id: loyaltyPlanId } = await loyaltyPlanRepository.upsert({
      petShopId: 'petshop-01',
      pointsPerReal: 1,
    });
    const { id: promotionId } = await loyaltyPromotionRepository.create({
      loyaltyPlanId,
      description: 'Descrição Antiga',
      pointsNeeded: 100,
      serviceCredits: [],
    });

    const { promotion: updatedPromotion } = await sut.execute({
      petShopId: 'petshop-01',
      promotionId,
      data: { description: 'Descrição Nova', pointsNeeded: 150 },
    });

    expect(updatedPromotion.description).toBe('Descrição Nova');
    expect(updatedPromotion.pointsNeeded).toBe(150);
  });

  it('não deve ser capaz de atualizar uma promoção de outro petshop', async () => {
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
        petShopId: 'petshop-02-intruso', // Tentando atualizar como outro petshop
        promotionId,
        data: { description: 'Tentativa de hack' },
      }),
    ).rejects.toBeInstanceOf(NotAllowedError);
  });

  it('deve lançar um erro se a promoção não for encontrada', async () => {
    await expect(
      sut.execute({
        petShopId: 'petshop-01',
        promotionId: 'id-fantasma',
        data: {},
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
