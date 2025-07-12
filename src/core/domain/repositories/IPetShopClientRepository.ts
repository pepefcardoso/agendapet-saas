import { PetShopClient, ClientUser } from '@prisma/client';

export interface IPetShopClientRepository {
  link(petShopId: string, clientId: string): Promise<PetShopClient>;
  findByPetShopAndClient(petShopId: string, clientId: string): Promise<PetShopClient | null>;
  listByPetShopId(petShopId: string): Promise<ClientUser[]>;
}
