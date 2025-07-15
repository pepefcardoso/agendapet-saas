import { IClientSubscriptionPlanRepository } from '@/core/domain/repositories/IClientSubscriptionPlanRepository';
import { ClientSubscriptionPlan, Prisma } from '@prisma/client';
import { prisma } from '../client';

export class PrismaClientSubscriptionPlanRepository implements IClientSubscriptionPlanRepository {
  async findById(id: string): Promise<ClientSubscriptionPlan | null> {
    const plan = await prisma.clientSubscriptionPlan.findUnique({
      where: { id },
    });
    return plan as ClientSubscriptionPlan | null;
  }

  async listByPetShop(petShopId: string): Promise<ClientSubscriptionPlan[]> {
    const plans = await prisma.clientSubscriptionPlan.findMany({
      where: {
        petShopId,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return plans;
  }

  async create(data: {
    name: string;
    price: number;
    credits: Prisma.InputJsonValue;
    petShopId: string;
  }): Promise<ClientSubscriptionPlan> {
    const plan = await prisma.clientSubscriptionPlan.create({
      data: {
        name: data.name,
        price: data.price,
        credits: data.credits,
        petShopId: data.petShopId,
        isActive: true,
      },
    });
    return plan;
  }

  async save(plan: ClientSubscriptionPlan): Promise<ClientSubscriptionPlan> {
    const updatedPlan = await prisma.clientSubscriptionPlan.update({
      where: {
        id: plan.id,
      },
      data: {
        name: plan.name,
        price: plan.price,
        credits: plan.credits ?? Prisma.JsonNull,
        isActive: plan.isActive,
      },
    });
    return updatedPlan;
  }
}
