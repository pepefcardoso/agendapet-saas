import { IPetRepository } from '@/core/domain/repositories/IPetRepository';
import { Pet, PetSize } from '@prisma/client';

interface ICreatePetUseCaseRequest {
  name: string;
  size: PetSize;
  ownerId: string;
}

interface ICreatePetUseCaseResponse {
  pet: Pet;
}

export class CreatePetUseCase {
  constructor(private petRepository: IPetRepository) {}

  async execute({
    name,
    size,
    ownerId,
  }: ICreatePetUseCaseRequest): Promise<ICreatePetUseCaseResponse> {
    const pet = await this.petRepository.create({
      name,
      size,
      ownerId,
    });

    return {
      pet,
    };
  }
}
