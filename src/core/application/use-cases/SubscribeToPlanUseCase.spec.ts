import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryClientSubscriptionPlanRepository } from '@/core/domain/repositories/in-memory/InMemoryClientSubscriptionPlanRepository';
import { InMemoryClientSubscriptionRepository } from '@/core/domain/repositories/in-memory/InMemoryClientSubscriptionRepository';
import { SubscribeToPlanUseCase } from './SubscribeToPlanUseCase';
import { SubscriptionFailedError } from './errors/SubscriptionFailedError';

let planRepository: InMemoryClientSubscriptionPlanRepository;
let subscriptionRepository: InMemoryClientSubscriptionRepository;
let sut: SubscribeToPlanUseCase;

describe('Subscribe To Plan Use Case', () => {
  beforeEach(async () => {
    planRepository = new InMemoryClientSubscriptionPlanRepository();
    subscriptionRepository = new InMemoryClientSubscriptionRepository();
    sut = new SubscribeToPlanUseCase(subscriptionRepository, planRepository);

    // Cria um plano com créditos para o teste
    await planRepository.create({
      id: 'plan-01',
      name: 'Plano com Créditos',
      petShopId: 'petshop-01',
      price: 150,
      credits: [
        { serviceId: 'service-cuid-01', quantity: 4 },
        { serviceId: 'service-cuid-02', quantity: 1 },
      ],
    });
  });

  it('should be able to subscribe a client to a plan', async () => {
    const subscription = await sut.execute({
      clientId: 'client-01',
      planId: 'plan-01',
    });

    expect(subscription.id).toEqual(expect.any(String));
    expect(subscriptionRepository.subscriptions).toHaveLength(1);
    // Deve criar 2 tipos de crédito
    expect(subscriptionRepository.credits).toHaveLength(2);
    expect(subscriptionRepository.credits[0].remainingCredits).toBe(4);
  });

  it('should not allow a client to subscribe to the same plan twice', async () => {
    // Assina uma vez
    await sut.execute({ clientId: 'client-01', planId: 'plan-01' });

    // Tenta assinar novamente
    await expect(sut.execute({ clientId: 'client-01', planId: 'plan-01' })).rejects.toBeInstanceOf(
      SubscriptionFailedError,
    );
  });
});
