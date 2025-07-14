import { ClientSubscriptionPlan } from '../entities/ClientSubscriptionPlan';

export interface CreateClientSubscriptionPlanDTO {
  name: string;
  price: number;
  credits: unknown;
  petShopId: string;
}

export interface UpdateClientSubscriptionPlanDTO {
  name?: string;
  price?: number;
  credits?: unknown;
}

export interface IClientSubscriptionPlanRepository {
  create(data: CreateClientSubscriptionPlanDTO): Promise<ClientSubscriptionPlan>;
  findById(id: string): Promise<ClientSubscriptionPlan | null>;
  findUniqueByPetShopAndId(petShopId: string, id: string): Promise<ClientSubscriptionPlan | null>;
  findByPetShopId(petShopId: string): Promise<ClientSubscriptionPlan[]>;
  save(plan: ClientSubscriptionPlan): Promise<ClientSubscriptionPlan>;
}
