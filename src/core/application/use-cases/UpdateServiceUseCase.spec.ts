import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateServiceUseCase } from './UpdateServiceUseCase';
import { IServiceRepository } from '@/core/domain/repositories/IServiceRepository';
import { Service, Prisma } from '@prisma/client';
import { ServiceNotFoundError } from './errors/ServiceNotFoundError';
import { NotAuthorizedError } from './errors/NotAuthorizedError';

let servicesDatabase: Service[] = [];
const inMemoryServiceRepository: IServiceRepository = {
  async findById(id) {
    return servicesDatabase.find((s) => s.id === id) || null;
  },
  async update(id, data) {
    const serviceIndex = servicesDatabase.findIndex((s) => s.id === id);
    if (serviceIndex === -1) return null;
    const service = servicesDatabase[serviceIndex];

    if (data.price) {
      data.price = new Prisma.Decimal(data.price as number);
    }

    Object.assign(service, data);
    return service;
  },
  async create(data) {
    const newService: Service = {
      id: data.id || `service-${servicesDatabase.length + 1}`,
      name: data.name,
      duration: data.duration,
      price: new Prisma.Decimal(data.price as number),
      petShopId: data.petShopId,
    };
    servicesDatabase.push(newService);
    return newService;
  },
  async delete() {},
  async findByPetShopId() {
    return [];
  },
};

let sut: UpdateServiceUseCase;

describe('Update Service Use Case', () => {
  beforeEach(async () => {
    servicesDatabase = [];
    sut = new UpdateServiceUseCase(inMemoryServiceRepository);

    await inMemoryServiceRepository.create({
      id: 'service-01',
      name: 'Banho Comum',
      duration: 45,
      price: 50,
      petShopId: 'petshop-01',
    });
  });

  it('should be able to update a service', async () => {
    const { service } = await sut.execute({
      serviceId: 'service-01',
      petShopId: 'petshop-01',
      data: {
        name: 'Banho Especial',
        price: 60,
      },
    });

    expect(service.name).toEqual('Banho Especial');
    expect(new Prisma.Decimal(service.price).toNumber()).toEqual(60);
    expect(servicesDatabase[0].name).toEqual('Banho Especial');
  });

  it('should not be able to update a non-existent service', async () => {
    await expect(() =>
      sut.execute({
        serviceId: 'non-existent-id',
        petShopId: 'petshop-01',
        data: { name: 'New Name' },
      }),
    ).rejects.toBeInstanceOf(ServiceNotFoundError);
  });

  it('should not be able to update a service from another petshop', async () => {
    await expect(() =>
      sut.execute({
        serviceId: 'service-01',
        petShopId: 'petshop-02',
        data: { name: 'New Name' },
      }),
    ).rejects.toBeInstanceOf(NotAuthorizedError);
  });
});
