import { IPetRepository } from '@/core/domain/repositories/IPetRepository';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';
import { NotAuthorizedError } from './errors/NotAuthorizedError';

interface IDeletePetUseCaseRequest {
  petId: string;
  ownerId: string;
}

export class DeletePetUseCase {
  constructor(private petRepository: IPetRepository) {}

  async execute({ petId, ownerId }: IDeletePetUseCaseRequest): Promise<void> {
    const petToDelete = await this.petRepository.findById(petId);

    if (!petToDelete) {
      throw new ResourceNotFoundError();
    }

    if (petToDelete.ownerId !== ownerId) {
      throw new NotAuthorizedError();
    }

    await this.petRepository.delete(petId);
  }
}
