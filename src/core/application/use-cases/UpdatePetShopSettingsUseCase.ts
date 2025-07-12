import { PetShop } from '@prisma/client';
import { IPetShopRepository } from '@/core/domain/repositories/IPetShopRepository';
import { IUpdatePetShopSettingsUseCaseRequest } from './dtos/UpdatePetShopSettingsDTO';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';

interface IUpdatePetShopSettingsUseCaseResponse {
  petShop: PetShop;
}

export class UpdatePetShopSettingsUseCase {
  constructor(private petShopRepository: IPetShopRepository) {}

  async execute({
    petShopId,
    data,
  }: IUpdatePetShopSettingsUseCaseRequest): Promise<IUpdatePetShopSettingsUseCaseResponse> {
    const petShopExists = await this.petShopRepository.findById(petShopId);

    if (!petShopExists) {
      throw new ResourceNotFoundError();
    }

    const petShop = await this.petShopRepository.update(petShopId, data);

    return {
      petShop,
    };
  }
}
