import { ClientSubscriptionPlan, Prisma } from '@prisma/client';

export interface IClientSubscriptionPlanRepository {
  findById(id: string): Promise<ClientSubscriptionPlan | null>;
  listByPetShop(petShopId: string): Promise<ClientSubscriptionPlan[]>;
  create(data: {
    name: string;
    price: number;
    credits: Prisma.InputJsonValue;
    petShopId: string;
  }): Promise<ClientSubscriptionPlan>;
  save(plan: ClientSubscriptionPlan): Promise<ClientSubscriptionPlan>;
}
