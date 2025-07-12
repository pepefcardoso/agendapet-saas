import { PetShop } from '@prisma/client';
import { IPetShopRepository } from '@/core/domain/repositories/IPetShopRepository';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';

interface IGetMyPetShopUseCaseRequest {
  petShopId: string;
}

interface IGetMyPetShopUseCaseResponse {
  petShop: PetShop;
}

export class GetMyPetShopUseCase {
  constructor(private petShopRepository: IPetShopRepository) {}

  async execute({ petShopId }: IGetMyPetShopUseCaseRequest): Promise<IGetMyPetShopUseCaseResponse> {
    const petShop = await this.petShopRepository.findById(petShopId);

    if (!petShop) {
      throw new ResourceNotFoundError();
    }

    return {
      petShop,
    };
  }
}
