import { InMemoryLoyaltyPlanRepository } from '@/core/domain/repositories/in-memory/InMemoryLoyaltyPlanRepository';
import { describe, it, expect, beforeEach } from 'vitest';
import { CreateOrUpdateLoyaltyPlanUseCase } from './CreateOrUpdateLoyaltyPlanUseCase';

let loyaltyPlanRepository: InMemoryLoyaltyPlanRepository;
let sut: CreateOrUpdateLoyaltyPlanUseCase; // SUT: System Under Test

describe('Create or Update Loyalty Plan Use Case', () => {
  beforeEach(() => {
    loyaltyPlanRepository = new InMemoryLoyaltyPlanRepository();
    sut = new CreateOrUpdateLoyaltyPlanUseCase(loyaltyPlanRepository);
  });

  it('deve ser capaz de criar um novo plano de fidelidade', async () => {
    const { loyaltyPlan } = await sut.execute({
      petShopId: 'petshop-01',
      pointsPerReal: 1,
    });

    expect(loyaltyPlan.id).toEqual(expect.any(String));
    expect(loyaltyPlan.petShopId).toBe('petshop-01');
    expect(loyaltyPlanRepository.items).toHaveLength(1);
    expect(loyaltyPlanRepository.items[0].pointsPerReal).toBe(1);
  });

  it('deve ser capaz de atualizar um plano de fidelidade existente', async () => {
    // Cria o plano inicial
    await sut.execute({
      petShopId: 'petshop-01',
      pointsPerReal: 1,
    });

    // Atualiza o plano
    const { loyaltyPlan: updatedPlan } = await sut.execute({
      petShopId: 'petshop-01',
      pointsPerReal: 2,
    });

    expect(updatedPlan.pointsPerReal).toBe(2);
    // Garante que não foi criado um novo registro
    expect(loyaltyPlanRepository.items).toHaveLength(1);
  });
});
