import { LoyaltyPromotion } from '@prisma/client';
import { prisma } from '../client';
import { ILoyaltyPromotionRepository } from '@/core/domain/repositories/ILoyaltyPromotionRepository';

export class PrismaLoyaltyPromotionRepository implements ILoyaltyPromotionRepository {
  async create(data: {
    loyaltyPlanId: string;
    description: string;
    pointsNeeded: number;
    serviceCredits: { serviceId: string; quantity: number }[];
  }): Promise<LoyaltyPromotion> {
    const promotion = await prisma.loyaltyPromotion.create({
      data: {
        loyaltyPlanId: data.loyaltyPlanId,
        description: data.description,
        pointsNeeded: data.pointsNeeded,
        serviceCredits: data.serviceCredits as any,
      },
    });
    return promotion;
  }

  async findById(
    id: string,
  ): Promise<(LoyaltyPromotion & { loyaltyPlan: { petShopId: string } }) | null> {
    const promotion = await prisma.loyaltyPromotion.findUnique({
      where: { id },
      include: {
        loyaltyPlan: {
          select: {
            petShopId: true,
          },
        },
      },
    });
    return promotion;
  }

  async listByLoyaltyPlanId(loyaltyPlanId: string): Promise<LoyaltyPromotion[]> {
    const promotions = await prisma.loyaltyPromotion.findMany({
      where: { loyaltyPlanId },
    });
    return promotions;
  }

  async update(
    id: string,
    data: Partial<{
      description: string;
      pointsNeeded: number;
      serviceCredits: { serviceId: string; quantity: number }[];
    }>,
  ): Promise<LoyaltyPromotion> {
    const promotion = await prisma.loyaltyPromotion.update({
      where: { id },
      data: {
        ...data,
        serviceCredits: data.serviceCredits ? (data.serviceCredits as any) : undefined,
      },
    });
    return promotion;
  }

  async delete(id: string): Promise<void> {
    await prisma.loyaltyPromotion.delete({
      where: { id },
    });
  }
}
