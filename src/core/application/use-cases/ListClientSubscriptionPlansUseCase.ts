import { IClientSubscriptionPlanRepository } from '@/core/domain/repositories/IClientSubscriptionPlanRepository';
import { IUseCase } from './IUseCase';
import { ClientSubscriptionPlan } from '@prisma/client';

interface IListClientSubscriptionPlansRequestDTO {
  petShopId: string;
}

export class ListClientSubscriptionPlansUseCase
  implements IUseCase<IListClientSubscriptionPlansRequestDTO, ClientSubscriptionPlan[]>
{
  constructor(private clientSubscriptionPlanRepository: IClientSubscriptionPlanRepository) {}

  async execute({
    petShopId,
  }: IListClientSubscriptionPlansRequestDTO): Promise<ClientSubscriptionPlan[]> {
    const plans = await this.clientSubscriptionPlanRepository.listByPetShop(petShopId);
    return plans;
  }
}
