import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryClientSubscriptionPlanRepository } from '@/core/domain/repositories/in-memory/InMemoryClientSubscriptionPlanRepository';
import { UpdateClientSubscriptionPlanUseCase } from './UpdateClientSubscriptionPlanUseCase';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';
import { Prisma } from '@prisma/client';

let planRepository: InMemoryClientSubscriptionPlanRepository;
let sut: UpdateClientSubscriptionPlanUseCase;

describe('Update Client Subscription Plan Use Case', () => {
  beforeEach(async () => {
    planRepository = new InMemoryClientSubscriptionPlanRepository();
    sut = new UpdateClientSubscriptionPlanUseCase(planRepository);

    await planRepository.create({
      id: 'plan-01',
      name: 'Plano Original',
      price: 100,
      petShopId: 'petshop-01',
      credits: {},
    });
  });

  it('should be able to update a subscription plan', async () => {
    const updatedPlan = await sut.execute({
      planId: 'plan-01',
      petShopId: 'petshop-01',
      data: { name: 'Plano Atualizado', price: Prisma.Decimal('120') },
    });

    expect(updatedPlan.name).toBe('Plano Atualizado');
    expect(planRepository.items[0].price).toEqual(new Prisma.Decimal(120));
  });

  it('should not be able to update a non-existent plan', async () => {
    await expect(
      sut.execute({
        planId: 'plan-nao-existe',
        petShopId: 'petshop-01',
        data: { name: 'Inexistente' },
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
