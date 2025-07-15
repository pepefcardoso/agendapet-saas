import { ClientSubscriptionPlan, Prisma } from '@prisma/client';
import { IClientSubscriptionPlanRepository } from '../IClientSubscriptionPlanRepository';

export class InMemoryClientSubscriptionPlanRepository implements IClientSubscriptionPlanRepository {
  public items: ClientSubscriptionPlan[] = [];

  async findById(id: string): Promise<ClientSubscriptionPlan | null> {
    const plan = this.items.find((item) => item.id === id);
    return plan || null;
  }

  async listByPetShop(petShopId: string): Promise<ClientSubscriptionPlan[]> {
    return this.items.filter((item) => item.petShopId === petShopId && item.isActive);
  }

  async create(
    data: Prisma.ClientSubscriptionPlanUncheckedCreateInput,
  ): Promise<ClientSubscriptionPlan> {
    const plan: ClientSubscriptionPlan = {
      id: `plan-${this.items.length + 1}`,
      name: data.name,
      price: new Prisma.Decimal(data.price as number),
      credits: data.credits as number,
      petShopId: data.petShopId,
      isActive: true,
    };
    this.items.push(plan);
    return plan;
  }

  async save(plan: ClientSubscriptionPlan): Promise<ClientSubscriptionPlan> {
    const planIndex = this.items.findIndex((item) => item.id === plan.id);
    if (planIndex >= 0) {
      this.items[planIndex] = plan;
    }
    return plan;
  }
}
