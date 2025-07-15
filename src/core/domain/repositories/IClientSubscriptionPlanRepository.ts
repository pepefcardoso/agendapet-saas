import { ClientSubscriptionPlan } from '@prisma/client';

export interface IClientSubscriptionPlanRepository {
  findById(id: string): Promise<ClientSubscriptionPlan | null>;
  listByPetShop(petShopId: string): Promise<ClientSubscriptionPlan[]>;
  create(data: {
    name: string;
    price: number;
    credits: any;
    petShopId: string;
  }): Promise<ClientSubscriptionPlan>;
  save(plan: ClientSubscriptionPlan): Promise<ClientSubscriptionPlan>;
}
