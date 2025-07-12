import { IServiceRepository } from '@/core/domain/repositories/IServiceRepository';
import { Service } from '@prisma/client';

interface IListServicesByPetShopUseCaseRequest {
  petShopId: string;
}

interface IListServicesByPetShopUseCaseResponse {
  services: Service[];
}

export class ListServicesByPetShopUseCase {
  constructor(private serviceRepository: IServiceRepository) {}

  async execute({
    petShopId,
  }: IListServicesByPetShopUseCaseRequest): Promise<IListServicesByPetShopUseCaseResponse> {
    const services = await this.serviceRepository.findByPetShopId(petShopId);

    return { services };
  }
}
