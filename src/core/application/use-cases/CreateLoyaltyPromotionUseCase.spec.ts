import { InMemoryLoyaltyPlanRepository } from '@/core/domain/repositories/in-memory/InMemoryLoyaltyPlanRepository';
import { InMemoryLoyaltyPromotionRepository } from '@/core/domain/repositories/in-memory/InMemoryLoyaltyPromotionRepository';
import { describe, it, expect, beforeEach } from 'vitest';
import { CreateLoyaltyPromotionUseCase } from './CreateLoyaltyPromotionUseCase';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';

let loyaltyPlanRepository: InMemoryLoyaltyPlanRepository;
let loyaltyPromotionRepository: InMemoryLoyaltyPromotionRepository;
let sut: CreateLoyaltyPromotionUseCase;

describe('Create Loyalty Promotion Use Case', () => {
  beforeEach(async () => {
    loyaltyPlanRepository = new InMemoryLoyaltyPlanRepository();
    loyaltyPromotionRepository = new InMemoryLoyaltyPromotionRepository(loyaltyPlanRepository);
    sut = new CreateLoyaltyPromotionUseCase(loyaltyPlanRepository, loyaltyPromotionRepository);
  });

  it('deve ser capaz de criar uma nova promoção de fidelidade', async () => {
    // Pré-condição: O petshop deve ter um plano de fidelidade
    const loyaltyPlan = await loyaltyPlanRepository.upsert({
      petShopId: 'petshop-01',
      pointsPerReal: 1,
    });

    const { promotion } = await sut.execute({
      petShopId: 'petshop-01',
      description: 'Banho Grátis',
      pointsNeeded: 100,
      serviceCredits: [{ serviceId: 'service-01', quantity: 1 }],
    });

    expect(promotion.id).toEqual(expect.any(String));
    expect(promotion.loyaltyPlanId).toBe(loyaltyPlan.id);
    expect(loyaltyPromotionRepository.items).toHaveLength(1);
  });

  it('não deve ser capaz de criar uma promoção se o plano de fidelidade do petshop não existir', async () => {
    await expect(
      sut.execute({
        petShopId: 'petshop-fantasma',
        description: 'Promoção Inválida',
        pointsNeeded: 100,
        serviceCredits: [],
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
