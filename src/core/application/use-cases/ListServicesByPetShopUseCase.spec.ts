import { describe, it, expect, beforeEach } from 'vitest';
import { IServiceRepository } from '@/core/domain/repositories/IServiceRepository';
import { ListServicesByPetShopUseCase } from './ListServicesByPetShopUseCase';
import { Service, Prisma } from '@prisma/client';

let servicesDatabase: Service[] = [];
const inMemoryServiceRepository: IServiceRepository = {
  async findByPetShopId(petShopId: string) {
    return servicesDatabase.filter((s) => s.petShopId === petShopId);
  },
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
};

let sut: ListServicesByPetShopUseCase;

describe('List Services By PetShop Use Case', () => {
  beforeEach(() => {
    servicesDatabase = [];
    sut = new ListServicesByPetShopUseCase(inMemoryServiceRepository);
  });

  it('should be able to list all services for a specific petshop', async () => {
    await inMemoryServiceRepository.create({
      name: 'Serviço A1',
      duration: 30,
      price: 30,
      petShopId: 'petshop-01',
    });
    await inMemoryServiceRepository.create({
      name: 'Serviço A2',
      duration: 45,
      price: 45,
      petShopId: 'petshop-01',
    });
    await inMemoryServiceRepository.create({
      name: 'Serviço B1',
      duration: 60,
      price: 60,
      petShopId: 'petshop-02',
    });

    const { services } = await sut.execute({ petShopId: 'petshop-01' });

    expect(services.length).toBe(2);
    expect(services[0].name).toEqual('Serviço A1');
    expect(services[1].name).toEqual('Serviço A2');
  });
});
