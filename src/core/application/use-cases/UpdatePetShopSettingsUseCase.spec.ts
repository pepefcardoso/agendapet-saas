import { describe, it, expect, beforeEach } from 'vitest';
import { UpdatePetShopSettingsUseCase } from './UpdatePetShopSettingsUseCase';
import { IPetShopRepository } from '@/core/domain/repositories/IPetShopRepository';
import { PetShop } from '@prisma/client';
import {
  CreatePetShopData,
  UpdatePetShopData,
} from '@/core/domain/repositories/IPetShopRepository';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';

let petShopsDatabase: PetShop[] = [];
const inMemoryPetShopRepository: IPetShopRepository = {
  async findById(id: string) {
    return petShopsDatabase.find((p) => p.id === id) || null;
  },
  async update(id: string, data: UpdatePetShopData) {
    const petShopIndex = petShopsDatabase.findIndex((p) => p.id === id);
    if (petShopIndex === -1) throw new Error('Not found');

    const petShop = petShopsDatabase[petShopIndex];

    Object.assign(petShop, data);
    petShopsDatabase[petShopIndex] = petShop;

    return petShop;
  },
  async create(data: CreatePetShopData) {
    const newPetShop: PetShop = {
      id: `petshop-${petShopsDatabase.length + 1}`,
      name: data.name,
      address: null,
      phone: null,
      workingHours: null,
      activeSubscriptionId: null,
    };
    petShopsDatabase.push(newPetShop);
    return newPetShop;
  },
};

let sut: UpdatePetShopSettingsUseCase;

describe('Update PetShop Settings Use Case', () => {
  const testPetShopId = 'petshop-01';

  beforeEach(async () => {
    petShopsDatabase = [];
    await inMemoryPetShopRepository.create({ id: testPetShopId, name: 'Original Name' });
    sut = new UpdatePetShopSettingsUseCase(inMemoryPetShopRepository);
  });

  it('should be able to update petshop settings', async () => {
    const { petShop } = await sut.execute({
      petShopId: testPetShopId,
      data: {
        name: 'Updated Name',
        address: '123 Main St',
      },
    });

    expect(petShop.name).toBe('Updated Name');
    expect(petShop.address).toBe('123 Main St');
    expect(petShopsDatabase[0].name).toBe('Updated Name');
  });

  it('should throw an error if petshop is not found', async () => {
    await expect(() =>
      sut.execute({
        petShopId: 'non-existing-id',
        data: { name: 'Any Name' },
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
