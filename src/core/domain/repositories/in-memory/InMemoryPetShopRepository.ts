import {
  IPetShopRepository,
  CreatePetShopData,
  UpdatePetShopData,
} from '@/core/domain/repositories/IPetShopRepository';
import { PetShop, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

export class InMemoryPetShopRepository implements IPetShopRepository {
  private items: PetShop[] = [];

  async create(data: CreatePetShopData): Promise<PetShop> {
    const petShop: PetShop = {
      id: data.id ?? randomUUID(),
      name: data.name,
      address: data.address ?? null,
      phone: data.phone ?? null,
      workingHours: (data.workingHours as unknown as Prisma.JsonValue) ?? {},
      activeSubscriptionId: (data.activeSubscription as string) ?? null,
    };
    this.items.push(petShop);
    return petShop;
  }

  async findById(id: string): Promise<PetShop | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async update(id: string, data: UpdatePetShopData): Promise<PetShop> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`PetShop with id ${id} not found`);
    }
    const existing = this.items[index];
    const updated: PetShop = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    } as PetShop;
    this.items[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
