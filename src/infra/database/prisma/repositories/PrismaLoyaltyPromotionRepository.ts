import { LoyaltyPromotion, Prisma } from '@prisma/client';
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
        serviceCredits: data.serviceCredits as Prisma.InputJsonValue,
      },
    });
    return promotion;
  }

  async findById(id: string, tx?: Prisma.TransactionClient): Promise<LoyaltyPromotion | null> {
    const db = tx ?? prisma;
    return db.loyaltyPromotion.findUnique({ where: { id } });
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
        // Usamos Prisma.InputJsonValue para o cast quando serviceCredits está presente.
        // Isso alinha com o tipo que o Prisma espera para campos JSONB.
        serviceCredits: data.serviceCredits
          ? (data.serviceCredits as Prisma.InputJsonValue)
          : undefined,
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
