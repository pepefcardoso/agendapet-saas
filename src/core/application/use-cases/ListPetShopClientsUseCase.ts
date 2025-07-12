import { IPetShopClientRepository } from '@/core/domain/repositories/IPetShopClientRepository';
import { ClientUser } from '@prisma/client';

interface IListPetShopClientsUseCaseRequest {
  petShopId: string;
}

interface IListPetShopClientsUseCaseResponse {
  clients: ClientUser[];
}

export class ListPetShopClientsUseCase {
  constructor(private petShopClientRepository: IPetShopClientRepository) {}

  async execute({
    petShopId,
  }: IListPetShopClientsUseCaseRequest): Promise<IListPetShopClientsUseCaseResponse> {
    const clients = await this.petShopClientRepository.listByPetShopId(petShopId);
    return { clients };
  }
}
