import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryClientSubscriptionPlanRepository } from '@/core/domain/repositories/in-memory/InMemoryClientSubscriptionPlanRepository';
import { CreateClientSubscriptionPlanUseCase } from './CreateClientSubscriptionPlanUseCase';

let planRepository: InMemoryClientSubscriptionPlanRepository;
let sut: CreateClientSubscriptionPlanUseCase; // SUT = System Under Test

describe('Create Client Subscription Plan Use Case', () => {
  beforeEach(() => {
    planRepository = new InMemoryClientSubscriptionPlanRepository();
    sut = new CreateClientSubscriptionPlanUseCase(planRepository);
  });

  it('should be able to create a new subscription plan', async () => {
    const plan = await sut.execute({
      name: 'Plano Teste',
      price: 99.9,
      credits: { baths: 2 },
      petShopId: 'petshop-01',
    });

    expect(plan.id).toEqual(expect.any(String));
    expect(planRepository.items).toHaveLength(1);
    expect(planRepository.items[0].name).toBe('Plano Teste');
  });
});
