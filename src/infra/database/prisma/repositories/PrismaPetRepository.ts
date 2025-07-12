import { prisma } from '../client';
import {
  IPetRepository,
  CreatePetData,
  UpdatePetData,
} from '@/core/domain/repositories/IPetRepository';
import { Pet } from '@prisma/client';

export class PrismaPetRepository implements IPetRepository {
  async create(data: CreatePetData): Promise<Pet> {
    const pet = await prisma.pet.create({
      data,
    });
    return pet;
  }

  async findById(id: string): Promise<Pet | null> {
    const pet = await prisma.pet.findUnique({
      where: { id },
    });
    return pet;
  }

  async findByOwnerId(ownerId: string): Promise<Pet[]> {
    const pets = await prisma.pet.findMany({
      where: { ownerId },
    });
    return pets;
  }

  async update(id: string, data: UpdatePetData): Promise<Pet> {
    const pet = await prisma.pet.update({
      where: { id },
      data,
    });
    return pet;
  }

  async delete(id: string): Promise<void> {
    await prisma.pet.delete({
      where: { id },
    });
  }
}
