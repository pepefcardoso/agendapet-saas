import { IClientSubscriptionPlanRepository } from '@/core/domain/repositories/IClientSubscriptionPlanRepository';
import { IUseCase } from './IUseCase';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';
import { ClientSubscriptionPlan } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

interface IUpdateClientSubscriptionPlanRequestDTO {
  planId: string;
  petShopId: string;
  data: {
    name?: string;
    price?: Decimal;
    credits?: any;
  };
}

export class UpdateClientSubscriptionPlanUseCase
  implements IUseCase<IUpdateClientSubscriptionPlanRequestDTO, ClientSubscriptionPlan>
{
  constructor(private clientSubscriptionPlanRepository: IClientSubscriptionPlanRepository) {}

  async execute({
    planId,
    petShopId,
    data,
  }: IUpdateClientSubscriptionPlanRequestDTO): Promise<ClientSubscriptionPlan> {
    const plan = await this.clientSubscriptionPlanRepository.findById(planId);

    if (!plan) {
      throw new ResourceNotFoundError();
    }

    if (plan.petShopId !== petShopId) {
      throw new Error('Acesso negado.');
    }

    plan.name = data.name ?? plan.name;
    plan.price = data.price ?? plan.price;
    plan.credits = data.credits ?? plan.credits;

    await this.clientSubscriptionPlanRepository.save(plan);

    return plan;
  }
}
