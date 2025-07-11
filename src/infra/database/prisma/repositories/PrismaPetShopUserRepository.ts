import { prisma } from '../client';
import {
  IPetShopUserRepository,
  CreatePetShopUserData,
} from '@/core/domain/repositories/IPetShopUserRepository';
import { PetShopUser } from '@prisma/client';

export class PrismaPetShopUserRepository implements IPetShopUserRepository {
  async findByEmail(email: string): Promise<PetShopUser | null> {
    const user = await prisma.petShopUser.findUnique({
      where: {
        email,
      },
    });

    return user;
  }

  async create(data: CreatePetShopUserData): Promise<PetShopUser> {
    const user = await prisma.petShopUser.create({
      data,
    });

    return user;
  }
}
