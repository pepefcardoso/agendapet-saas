import { ILoyaltyPlanRepository } from '@/core/domain/repositories/ILoyaltyPlanRepository';
import { LoyaltyPlan } from '@prisma/client';
import { prisma } from '../client';

export class PrismaLoyaltyPlanRepository implements ILoyaltyPlanRepository {
  async findByPetShopId(petShopId: string): Promise<LoyaltyPlan | null> {
    const loyaltyPlan = await prisma.loyaltyPlan.findUnique({
      where: { petShopId },
    });
    return loyaltyPlan;
  }

  async upsert(data: { petShopId: string; pointsPerReal: number }): Promise<LoyaltyPlan> {
    const { petShopId, pointsPerReal } = data;

    const loyaltyPlan = await prisma.loyaltyPlan.upsert({
      where: {
        petShopId: petShopId,
      },
      update: {
        pointsPerReal: pointsPerReal,
      },
      create: {
        petShopId: petShopId,
        pointsPerReal: pointsPerReal,
      },
    });

    return loyaltyPlan;
  }
}
