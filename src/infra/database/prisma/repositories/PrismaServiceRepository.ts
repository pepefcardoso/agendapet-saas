import { prisma } from '../client';
import {
  IServiceRepository,
  CreateServiceData,
  UpdateServiceData,
} from '@/core/domain/repositories/IServiceRepository';
import { Service } from '@prisma/client';

export class PrismaServiceRepository implements IServiceRepository {
  async create(data: CreateServiceData): Promise<Service> {
    const service = await prisma.service.create({
      data,
    });
    return service;
  }

  async update(id: string, data: UpdateServiceData): Promise<Service | null> {
    const service = await prisma.service.update({
      where: { id },
      data,
    });
    return service;
  }

  async delete(id: string): Promise<void> {
    await prisma.service.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<Service | null> {
    const service = await prisma.service.findUnique({
      where: { id },
    });
    return service;
  }

  async findByPetShopId(petShopId: string): Promise<Service[]> {
    const services = await prisma.service.findMany({
      where: { petShopId },
    });
    return services;
  }
}
