import { IPetRepository, UpdatePetData } from '@/core/domain/repositories/IPetRepository';
import { Pet } from '@prisma/client';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';
import { NotAuthorizedError } from './errors/NotAuthorizedError';

interface IUpdatePetUseCaseRequest {
  petId: string;
  ownerId: string;
  data: UpdatePetData;
}

interface IUpdatePetUseCaseResponse {
  pet: Pet;
}

export class UpdatePetUseCase {
  constructor(private petRepository: IPetRepository) {}

  async execute({
    petId,
    ownerId,
    data,
  }: IUpdatePetUseCaseRequest): Promise<IUpdatePetUseCaseResponse> {
    const petToUpdate = await this.petRepository.findById(petId);

    if (!petToUpdate) {
      throw new ResourceNotFoundError();
    }

    if (petToUpdate.ownerId !== ownerId) {
      throw new NotAuthorizedError();
    }

    const pet = await this.petRepository.update(petId, data);

    return { pet };
  }
}
