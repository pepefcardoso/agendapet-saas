import { IServiceRepository } from '@/core/domain/repositories/IServiceRepository';
import { Service } from '@prisma/client';

interface ICreateServiceUseCaseRequest {
  name: string;
  duration: number;
  price: number;
  petShopId: string;
}

interface ICreateServiceUseCaseResponse {
  service: Service;
}

export class CreateServiceUseCase {
  constructor(private serviceRepository: IServiceRepository) {}

  async execute({
    name,
    duration,
    price,
    petShopId,
  }: ICreateServiceUseCaseRequest): Promise<ICreateServiceUseCaseResponse> {
    const service = await this.serviceRepository.create({
      name,
      duration,
      price,
      petShopId,
    });

    return { service };
  }
}
