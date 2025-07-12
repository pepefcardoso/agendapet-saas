import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteServiceUseCase } from './DeleteServiceUseCase';
import { IServiceRepository } from '@/core/domain/repositories/IServiceRepository';
import { Service, Prisma } from '@prisma/client';
import { ServiceNotFoundError } from './errors/ServiceNotFoundError';
import { NotAuthorizedError } from './errors/NotAuthorizedError';

// Mock do repositório
let servicesDatabase: Service[] = [];
const inMemoryServiceRepository: IServiceRepository = {
  async findById(id) {
    return servicesDatabase.find((s) => s.id === id) || null;
  },
  async delete(id) {
    servicesDatabase = servicesDatabase.filter((s) => s.id !== id);
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
  async update() {
    return null;
  },
  async findByPetShopId() {
    return [];
  },
};

let sut: DeleteServiceUseCase;

describe('Delete Service Use Case', () => {
  beforeEach(async () => {
    servicesDatabase = [];
    sut = new DeleteServiceUseCase(inMemoryServiceRepository);

    await inMemoryServiceRepository.create({
      id: 'service-01',
      name: 'Serviço para Deletar',
      duration: 30,
      price: 25,
      petShopId: 'petshop-01',
    });
  });

  it('should be able to delete a service', async () => {
    await sut.execute({
      serviceId: 'service-01',
      petShopId: 'petshop-01',
    });

    expect(servicesDatabase.length).toBe(0);
  });

  it('should not be able to delete a non-existent service', async () => {
    await expect(() =>
      sut.execute({
        serviceId: 'non-existent-id',
        petShopId: 'petshop-01',
      }),
    ).rejects.toBeInstanceOf(ServiceNotFoundError);
  });

  it('should not be able to delete a service from another petshop', async () => {
    await expect(() =>
      sut.execute({
        serviceId: 'service-01',
        petShopId: 'petshop-02',
      }),
    ).rejects.toBeInstanceOf(NotAuthorizedError);
  });
});
