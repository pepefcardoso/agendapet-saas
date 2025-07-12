import { describe, it, expect, beforeEach } from 'vitest';
import { IServiceRepository } from '@/core/domain/repositories/IServiceRepository';
import { CreateServiceUseCase } from './CreateServiceUseCase';
import { Service, Prisma } from '@prisma/client';

let servicesDatabase: Service[] = [];
const inMemoryServiceRepository: IServiceRepository = {
  async create(data) {
    const newService: Service = {
      id: `service-${servicesDatabase.length + 1}`,
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
  async delete() {},
  async findById() {
    return null;
  },
  async findByPetShopId() {
    return [];
  },
};

let sut: CreateServiceUseCase;

describe('Create Service Use Case', () => {
  beforeEach(() => {
    servicesDatabase = [];
    sut = new CreateServiceUseCase(inMemoryServiceRepository);
  });

  it('should be able to create a new service', async () => {
    const { service } = await sut.execute({
      name: 'Banho e Tosa',
      duration: 60,
      price: 50.0,
      petShopId: 'petshop-01',
    });

    expect(service.id).toEqual(expect.any(String));
    expect(servicesDatabase.length).toBe(1);
    expect(servicesDatabase[0].name).toEqual('Banho e Tosa');
  });
});
