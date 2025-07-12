import { IServiceRepository } from '@/core/domain/repositories/IServiceRepository';
import { ServiceNotFoundError } from './errors/ServiceNotFoundError';
import { NotAuthorizedError } from './errors/NotAuthorizedError';

interface IDeleteServiceUseCaseRequest {
  serviceId: string;
  petShopId: string;
}

export class DeleteServiceUseCase {
  constructor(private serviceRepository: IServiceRepository) {}

  async execute({ serviceId, petShopId }: IDeleteServiceUseCaseRequest): Promise<void> {
    const serviceToDelete = await this.serviceRepository.findById(serviceId);

    if (!serviceToDelete) {
      throw new ServiceNotFoundError();
    }

    if (serviceToDelete.petShopId !== petShopId) {
      throw new NotAuthorizedError();
    }

    await this.serviceRepository.delete(serviceId);
  }
}
