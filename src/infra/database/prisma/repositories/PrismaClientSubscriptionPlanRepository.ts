import {
  ClientSubscriptionPlan,
  planCreditsSchema,
} from '@/core/domain/entities/ClientSubscriptionPlan';
import {
  CreateClientSubscriptionPlanDTO,
  IClientSubscriptionPlanRepository,
} from '@/core/domain/repositories/IClientSubscriptionPlanRepository';
import { prisma } from '../client';

export class PrismaClientSubscriptionPlanRepository implements IClientSubscriptionPlanRepository {
  private toDomain(prismaPlan: any): ClientSubscriptionPlan {
    return {
      ...prismaPlan,
      price: prismaPlan.price.toNumber(),
      credits: planCreditsSchema.parse(prismaPlan.credits),
    };
  }

  async create(data: CreateClientSubscriptionPlanDTO): Promise<ClientSubscriptionPlan> {
    const parsedCredits = planCreditsSchema.parse(data.credits);

    const plan = await prisma.clientSubscriptionPlan.create({
      data: {
        name: data.name,
        price: data.price,
        petShopId: data.petShopId,
        credits: parsedCredits,
      },
    });
    return this.toDomain(plan);
  }

  async findById(id: string): Promise<ClientSubscriptionPlan | null> {
    const plan = await prisma.clientSubscriptionPlan.findUnique({
      where: { id },
    });
    if (!plan) return null;
    return this.toDomain(plan);
  }

  async findUniqueByPetShopAndId(
    petShopId: string,
    id: string,
  ): Promise<ClientSubscriptionPlan | null> {
    const plan = await prisma.clientSubscriptionPlan.findUnique({
      where: { id, petShopId },
    });
    if (!plan) return null;
    return this.toDomain(plan);
  }

  async findByPetShopId(petShopId: string): Promise<ClientSubscriptionPlan[]> {
    const plans = await prisma.clientSubscriptionPlan.findMany({
      where: { petShopId },
      orderBy: { createdAt: 'desc' },
    });
    return plans.map(this.toDomain);
  }

  async save(plan: ClientSubscriptionPlan): Promise<ClientSubscriptionPlan> {
    const parsedCredits = planCreditsSchema.parse(plan.credits);

    const updatedPlan = await prisma.clientSubscriptionPlan.update({
      where: { id: plan.id },
      data: {
        name: plan.name,
        price: plan.price,
        credits: parsedCredits,
        isActive: plan.isActive,
      },
    });
    return this.toDomain(updatedPlan);
  }
}
