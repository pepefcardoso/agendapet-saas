import { prisma } from '../client';
import { IPetShopClientRepository } from '@/core/domain/repositories/IPetShopClientRepository';
import { PetShopClient, ClientUser } from '@prisma/client';

export class PrismaPetShopClientRepository implements IPetShopClientRepository {
  async link(petShopId: string, clientId: string): Promise<PetShopClient> {
    const link = await prisma.petShopClient.create({
      data: {
        petShopId,
        clientId,
      },
    });
    return link;
  }

  async findByPetShopAndClient(petShopId: string, clientId: string): Promise<PetShopClient | null> {
    const link = await prisma.petShopClient.findUnique({
      where: {
        petShopId_clientId: {
          petShopId,
          clientId,
        },
      },
    });
    return link;
  }

  async listByPetShopId(petShopId: string): Promise<ClientUser[]> {
    const clients = await prisma.clientUser.findMany({
      where: {
        petShops: {
          some: {
            petShopId,
          },
        },
      },
    });
    return clients;
  }
}
