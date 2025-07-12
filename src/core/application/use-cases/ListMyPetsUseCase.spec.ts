import { describe, it, expect, beforeEach } from 'vitest';
import { ListMyPetsUseCase } from './ListMyPetsUseCase';
import { IPetRepository } from '@/core/domain/repositories/IPetRepository';
import { Pet } from '@prisma/client';

let petsDatabase: Pet[] = [];
const inMemoryPetRepository: IPetRepository = {
  async findByOwnerId(ownerId) {
    return petsDatabase.filter((p) => p.ownerId === ownerId);
  },
  async create() {
    return {} as Pet;
  },
  async findById() {
    return null;
  },
  async update() {
    return {} as Pet;
  },
  async delete() {},
};

let sut: ListMyPetsUseCase;

describe('List My Pets Use Case', () => {
  beforeEach(() => {
    petsDatabase = [
      { id: 'pet-1', name: 'Pet A1', ownerId: 'owner-A' } as Pet,
      { id: 'pet-2', name: 'Pet B1', ownerId: 'owner-B' } as Pet,
      { id: 'pet-3', name: 'Pet A2', ownerId: 'owner-A' } as Pet,
    ];
    sut = new ListMyPetsUseCase(inMemoryPetRepository);
  });

  it('should be able to list all pets from a specific owner', async () => {
    const { pets } = await sut.execute({ ownerId: 'owner-A' });
    expect(pets.length).toBe(2);
    expect(pets[0].name).toBe('Pet A1');
    expect(pets[1].name).toBe('Pet A2');
  });

  it('should return an empty array if an owner has no pets', async () => {
    const { pets } = await sut.execute({ ownerId: 'owner-C' });
    expect(pets.length).toBe(0);
  });
});
