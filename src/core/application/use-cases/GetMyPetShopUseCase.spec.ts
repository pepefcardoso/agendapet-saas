import { describe, it, expect, beforeEach } from 'vitest';
import { GetMyPetShopUseCase } from './GetMyPetShopUseCase';
import { IPetShopRepository } from '@/core/domain/repositories/IPetShopRepository';
import { PetShop } from '@prisma/client';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';
import { CreatePetShopData } from '@/core/domain/repositories/IPetShopRepository';

let petShopsDatabase: PetShop[] = [];
const inMemoryPetShopRepository: IPetShopRepository = {
  async findById(id: string) {
    return petShopsDatabase.find((p) => p.id === id) || null;
  },
  async create(data: CreatePetShopData) {
    const newPetShop: PetShop = {
      id: data.id || `petshop-${petShopsDatabase.length + 1}`,
      name: data.name,
      address: null,
      phone: null,
      workingHours: null,
      activeSubscriptionId: null,
    };
    petShopsDatabase.push(newPetShop);
    return newPetShop;
  },
  async update() {
    return {} as PetShop;
  },
};

let sut: GetMyPetShopUseCase;

describe('Get My PetShop Use Case', () => {
  const testPetShopId = 'petshop-01';

  beforeEach(async () => {
    petShopsDatabase = [];
    await inMemoryPetShopRepository.create({ id: testPetShopId, name: 'My PetShop' });
    sut = new GetMyPetShopUseCase(inMemoryPetShopRepository);
  });

  it('should be able to get petshop data', async () => {
    const { petShop } = await sut.execute({ petShopId: testPetShopId });

    expect(petShop.id).toBe(testPetShopId);
    expect(petShop.name).toBe('My PetShop');
  });

  it('should throw an error if petshop is not found', async () => {
    await expect(sut.execute({ petShopId: 'non-existing-id' })).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });
});
