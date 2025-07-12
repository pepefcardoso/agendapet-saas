import { IServiceRepository } from '@/core/domain/repositories/IServiceRepository';
import { Service } from '@prisma/client';
import { ServiceNotFoundError } from './errors/ServiceNotFoundError';
import { NotAuthorizedError } from './errors/NotAuthorizedError';

interface IUpdateServiceUseCaseRequest {
  serviceId: string;
  petShopId: string;
  data: {
    name?: string;
    duration?: number;
    price?: number;
  };
}

interface IUpdateServiceUseCaseResponse {
  service: Service;
}

export class UpdateServiceUseCase {
  constructor(private serviceRepository: IServiceRepository) {}

  async execute({
    serviceId,
    petShopId,
    data,
  }: IUpdateServiceUseCaseRequest): Promise<IUpdateServiceUseCaseResponse> {
    const serviceToUpdate = await this.serviceRepository.findById(serviceId);

    if (!serviceToUpdate) {
      throw new ServiceNotFoundError();
    }

    if (serviceToUpdate.petShopId !== petShopId) {
      throw new NotAuthorizedError();
    }

    const service = await this.serviceRepository.update(serviceId, data);

    return { service: service! };
  }
}
