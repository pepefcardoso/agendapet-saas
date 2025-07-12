import { describe, it, expect, beforeEach } from 'vitest';
import { CreatePetUseCase } from './CreatePetUseCase';
import { IPetRepository } from '@/core/domain/repositories/IPetRepository';
import { Pet, PetSize } from '@prisma/client';

// Mock do repositório de Pet em memória
let petsDatabase: Pet[] = [];
const inMemoryPetRepository: IPetRepository = {
  async create(data) {
    const newPet: Pet = {
      id: `pet-${petsDatabase.length + 1}`,
      name: data.name,
      size: data.size as PetSize,
      ownerId: data.ownerId,
    };
    petsDatabase.push(newPet);
    return newPet;
  },
  async findById() {
    return null;
  },
  async findByOwnerId() {
    return [];
  },
  async update() {
    return {} as Pet;
  },
  async delete() {},
};

let sut: CreatePetUseCase;

describe('Create Pet Use Case', () => {
  beforeEach(() => {
    petsDatabase = [];
    sut = new CreatePetUseCase(inMemoryPetRepository);
  });

  it('should be able to create a new pet', async () => {
    const { pet } = await sut.execute({
      name: 'Fido',
      size: 'MEDIO',
      ownerId: 'owner-01',
    });

    expect(pet.id).toEqual(expect.any(String));
    expect(pet.name).toBe('Fido');
    expect(petsDatabase.length).toBe(1);
    expect(petsDatabase[0].ownerId).toBe('owner-01');
  });
});
