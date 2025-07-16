import { prisma } from '../client';
import {
  IPetShopRepository,
  CreatePetShopData,
  UpdatePetShopData,
} from '@/core/domain/repositories/IPetShopRepository';
import { PetShop } from '@prisma/client';

export class PrismaPetShopRepository implements IPetShopRepository {
  async create(data: CreatePetShopData): Promise<PetShop> {
    const petShop = await prisma.petShop.create({
      data,
    });
    return petShop;
  }

  async findById(id: string): Promise<PetShop | null> {
    const petShop = await prisma.petShop.findUnique({
      where: { id },
    });
    return petShop;
  }

  async update(id: string, data: UpdatePetShopData): Promise<PetShop> {
    const petShop = await prisma.petShop.update({
      where: { id },
      data,
    });
    return petShop;
  }

  async delete(id: string): Promise<void> {
    await prisma.petShop.delete({
      where: { id },
    });
  }
}
