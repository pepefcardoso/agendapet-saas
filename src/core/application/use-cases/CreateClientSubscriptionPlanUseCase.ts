import { IClientSubscriptionPlanRepository } from '@/core/domain/repositories/IClientSubscriptionPlanRepository';
import { ClientSubscriptionPlan } from '@prisma/client';
import { IUseCase } from './IUseCase';

interface ICreateClientSubscriptionPlanRequestDTO {
  name: string;
  price: number;
  credits: any;
  petShopId: string;
}

export class CreateClientSubscriptionPlanUseCase
  implements IUseCase<ICreateClientSubscriptionPlanRequestDTO, ClientSubscriptionPlan>
{
  constructor(private clientSubscriptionPlanRepository: IClientSubscriptionPlanRepository) {}

  async execute(request: ICreateClientSubscriptionPlanRequestDTO): Promise<ClientSubscriptionPlan> {
    // A lógica de negócio poderia ser mais complexa aqui, por exemplo:
    // - Verificar se já existe um plano com o mesmo nome para o mesmo petshop.
    // - Validar se o `petShopId` existe.
    // - Validar a estrutura do objeto `credits`.

    const newPlan = await this.clientSubscriptionPlanRepository.create({
      name: request.name,
      price: request.price,
      credits: request.credits,
      petShopId: request.petShopId,
    });

    return newPlan;
  }
}
