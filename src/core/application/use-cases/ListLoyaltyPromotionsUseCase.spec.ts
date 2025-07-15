import { InMemoryLoyaltyPlanRepository } from '@/core/domain/repositories/in-memory/InMemoryLoyaltyPlanRepository';
import { InMemoryLoyaltyPromotionRepository } from '@/core/domain/repositories/in-memory/InMemoryLoyaltyPromotionRepository';
import { describe, it, expect, beforeEach } from 'vitest';
import { ListLoyaltyPromotionsUseCase } from './ListLoyaltyPromotionsUseCase';

let loyaltyPlanRepository: InMemoryLoyaltyPlanRepository;
let loyaltyPromotionRepository: InMemoryLoyaltyPromotionRepository;
let sut: ListLoyaltyPromotionsUseCase;

describe('List Loyalty Promotions Use Case', () => {
  beforeEach(async () => {
    loyaltyPlanRepository = new InMemoryLoyaltyPlanRepository();
    loyaltyPromotionRepository = new InMemoryLoyaltyPromotionRepository(loyaltyPlanRepository);
    sut = new ListLoyaltyPromotionsUseCase(loyaltyPlanRepository, loyaltyPromotionRepository);
  });

  it('deve ser capaz de listar as promoções de um petshop', async () => {
    const { id: loyaltyPlanId } = await loyaltyPlanRepository.upsert({
      petShopId: 'petshop-01',
      pointsPerReal: 1,
    });

    await loyaltyPromotionRepository.create({
      loyaltyPlanId,
      description: 'Promo 1',
      pointsNeeded: 10,
      serviceCredits: [],
    });
    await loyaltyPromotionRepository.create({
      loyaltyPlanId,
      description: 'Promo 2',
      pointsNeeded: 20,
      serviceCredits: [],
    });

    const { promotions } = await sut.execute({ petShopId: 'petshop-01' });

    expect(promotions).toHaveLength(2);
    expect(promotions[0].description).toBe('Promo 1');
  });

  it('deve retornar uma lista vazia se o petshop não tiver um plano de fidelidade', async () => {
    const { promotions } = await sut.execute({ petShopId: 'petshop-sem-plano' });

    expect(promotions).toHaveLength(0);
  });

  it('deve retornar uma lista vazia se o petshop tiver um plano, mas nenhuma promoção', async () => {
    await loyaltyPlanRepository.upsert({ petShopId: 'petshop-01', pointsPerReal: 1 });

    const { promotions } = await sut.execute({ petShopId: 'petshop-01' });

    expect(promotions).toHaveLength(0);
  });
});
