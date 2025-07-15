import { LoyaltyPromotion, LoyaltyPlan } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { ILoyaltyPromotionRepository } from '../ILoyaltyPromotionRepository';

type PromotionWithPlan = LoyaltyPromotion & { loyaltyPlan: { petShopId: string } };

export class InMemoryLoyaltyPromotionRepository implements ILoyaltyPromotionRepository {
  public items: PromotionWithPlan[] = [];

  constructor(private loyaltyPlanRepository: { items: LoyaltyPlan[] }) {}

  async create(data: {
    loyaltyPlanId: string;
    description: string;
    pointsNeeded: number;
    serviceCredits: { serviceId: string; quantity: number }[];
  }): Promise<LoyaltyPromotion> {
    const loyaltyPlan = this.loyaltyPlanRepository.items.find((p) => p.id === data.loyaltyPlanId);
    if (!loyaltyPlan)
      throw new Error('Plano de fidelidade não encontrado no repositório em memória.');

    const promotion: PromotionWithPlan = {
      id: randomUUID(),
      loyaltyPlanId: data.loyaltyPlanId,
      description: data.description,
      pointsNeeded: data.pointsNeeded,
      serviceCredits: data.serviceCredits as any,
      loyaltyPlan: {
        petShopId: loyaltyPlan.petShopId,
      },
    };

    this.items.push(promotion);
    return promotion;
  }

  async findById(id: string): Promise<PromotionWithPlan | null> {
    const promotion = this.items.find((item) => item.id === id);
    return promotion || null;
  }

  async listByLoyaltyPlanId(loyaltyPlanId: string): Promise<LoyaltyPromotion[]> {
    return this.items.filter((item) => item.loyaltyPlanId === loyaltyPlanId);
  }

  async update(
    id: string,
    data: Partial<{
      description: string;
      pointsNeeded: number;
      serviceCredits: { serviceId: string; quantity: number }[];
    }>,
  ): Promise<LoyaltyPromotion> {
    const promotionIndex = this.items.findIndex((item) => item.id === id);
    if (promotionIndex < 0) throw new Error('Promoção não encontrada.');

    this.items[promotionIndex] = { ...this.items[promotionIndex], ...data };
    return this.items[promotionIndex];
  }

  async delete(id: string): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === id);
    if (itemIndex > -1) {
      this.items.splice(itemIndex, 1);
    }
  }
}
