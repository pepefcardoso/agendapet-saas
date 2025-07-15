import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryClientSubscriptionPlanRepository } from '@/core/domain/repositories/in-memory/InMemoryClientSubscriptionPlanRepository';
import { DeactivateClientSubscriptionPlanUseCase } from './DeactivateClientSubscriptionPlanUseCase';

let planRepository: InMemoryClientSubscriptionPlanRepository;
let sut: DeactivateClientSubscriptionPlanUseCase;

describe('Deactivate Client Subscription Plan Use Case', () => {
  beforeEach(async () => {
    planRepository = new InMemoryClientSubscriptionPlanRepository();
    sut = new DeactivateClientSubscriptionPlanUseCase(planRepository);
    await planRepository.create({
      id: 'plan-01',
      name: 'Plano Ativo',
      petShopId: 'petshop-01',
      price: 1,
      credits: {},
    });
  });

  it('should be able to deactivate a plan', async () => {
    await sut.execute({ planId: 'plan-01', petShopId: 'petshop-01' });

    expect(planRepository.items[0].isActive).toBe(false);
  });
});
