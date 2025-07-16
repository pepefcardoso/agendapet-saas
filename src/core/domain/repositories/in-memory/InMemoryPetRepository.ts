
import { IPetRepository, CreatePetData, UpdatePetData } from '@/core/domain/repositories/IPetRepository';
import { Pet } from '@prisma/client';
import { randomUUID } from 'crypto';

export class InMemoryPetRepository implements IPetRepository {
  public items: Pet[] = [];

  async create(data: CreatePetData): Promise<Pet> {
    const pet: Pet = {
      id: data.id ?? randomUUID(),
      name: data.name as string,
      ownerId: data.ownerId as string,
      size: data.size,
    };

    this.items.push(pet);
    return pet;
  }

  async findById(id: string): Promise<Pet | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findByOwnerId(ownerId: string): Promise<Pet[]> {
    return this.items.filter((item) => item.ownerId === ownerId);
  }

  async update(id: string, data: UpdatePetData): Promise<Pet> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Pet with id ${id} not found`);
    }

    const existing = this.items[index];
    const updated: Pet = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    } as Pet;

    this.items[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Pet with id ${id} not found`);
    }
    this.items.splice(index, 1);
  }
}
