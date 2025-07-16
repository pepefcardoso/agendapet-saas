import {
  IServiceRepository,
  CreateServiceData,
  UpdateServiceData,
} from '@/core/domain/repositories/IServiceRepository';
import { Service } from '@prisma/client';
import { randomUUID } from 'crypto';

export class InMemoryServiceRepository implements IServiceRepository {
  public items: Service[] = [];

  async create(data: CreateServiceData): Promise<Service> {
    const service: Service = {
      id: data.id ?? randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Service;

    this.items.push(service);
    return service;
  }

  async update(id: string, data: UpdateServiceData): Promise<Service | null> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }

    const existing = this.items[index];
    const updated: Service = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    } as Service;

    this.items[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Service with id ${id} not found`);
    }
    this.items.splice(index, 1);
  }

  async findById(id: string): Promise<Service | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findByIds(ids: string[]): Promise<Service[]> {
    return this.items.filter((item) => ids.includes(item.id));
  }

  async findByPetShopId(petShopId: string): Promise<Service[]> {
    return this.items.filter((item) => item.petShopId === petShopId);
  }
}
