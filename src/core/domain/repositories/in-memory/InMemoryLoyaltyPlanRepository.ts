import { LoyaltyPlan } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { ILoyaltyPlanRepository } from '../ILoyaltyPlanRepository';

export class InMemoryLoyaltyPlanRepository implements ILoyaltyPlanRepository {
  public items: LoyaltyPlan[] = [];

  async findByPetShopId(petShopId: string): Promise<LoyaltyPlan | null> {
    const loyaltyPlan = this.items.find((item) => item.petShopId === petShopId);
    return loyaltyPlan || null;
  }

  async upsert(data: { petShopId: string; pointsPerReal: number }): Promise<LoyaltyPlan> {
    const existingPlanIndex = this.items.findIndex((item) => item.petShopId === data.petShopId);

    if (existingPlanIndex >= 0) {
      this.items[existingPlanIndex].pointsPerReal = data.pointsPerReal;
      return this.items[existingPlanIndex];
    }

    const newPlan: LoyaltyPlan = {
      id: randomUUID(),
      petShopId: data.petShopId,
      pointsPerReal: data.pointsPerReal,
    };

    this.items.push(newPlan);
    return newPlan;
  }
}
