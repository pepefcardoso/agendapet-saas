import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryClientSubscriptionPlanRepository } from '@/core/domain/repositories/in-memory/InMemoryClientSubscriptionPlanRepository';
import { ListClientSubscriptionPlansUseCase } from './ListClientSubscriptionPlansUseCase';

let planRepository: InMemoryClientSubscriptionPlanRepository;
let sut: ListClientSubscriptionPlansUseCase;

describe('List Client Subscription Plans Use Case', () => {
  beforeEach(async () => {
    planRepository = new InMemoryClientSubscriptionPlanRepository();
    sut = new ListClientSubscriptionPlansUseCase(planRepository);

    await planRepository.create({
      name: 'Plano A',
      petShopId: 'petshop-01',
      price: 1,
      credits: {},
    });
    await planRepository.create({
      name: 'Plano B',
      petShopId: 'petshop-01',
      price: 1,
      credits: {},
    });
    await planRepository.create({
      name: 'Plano C',
      petShopId: 'petshop-02',
      price: 1,
      credits: {},
    });
  });

  it('should be able to list plans for a specific petshop', async () => {
    const plans = await sut.execute({ petShopId: 'petshop-01' });

    expect(plans).toHaveLength(2);
    expect(plans[0].name).toBe('Plano A');
    expect(plans[1].name).toBe('Plano B');
  });
});
