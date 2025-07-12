import { IPetRepository } from '@/core/domain/repositories/IPetRepository';
import { Pet } from '@prisma/client';

interface IListMyPetsUseCaseRequest {
  ownerId: string;
}

interface IListMyPetsUseCaseResponse {
  pets: Pet[];
}

export class ListMyPetsUseCase {
  constructor(private petRepository: IPetRepository) {}

  async execute({ ownerId }: IListMyPetsUseCaseRequest): Promise<IListMyPetsUseCaseResponse> {
    const pets = await this.petRepository.findByOwnerId(ownerId);

    return {
      pets,
    };
  }
}
