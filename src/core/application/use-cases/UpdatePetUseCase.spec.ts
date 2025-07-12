import { describe, it, expect, beforeEach } from 'vitest';
import { UpdatePetUseCase } from './UpdatePetUseCase';
import { IPetRepository } from '@/core/domain/repositories/IPetRepository';
import { Pet } from '@prisma/client';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';
import { NotAuthorizedError } from './errors/NotAuthorizedError';

let petsDatabase: Pet[] = [];
const inMemoryPetRepository: IPetRepository = {
  async findById(id) {
    return petsDatabase.find((p) => p.id === id) || null;
  },
  async update(id, data) {
    const petIndex = petsDatabase.findIndex((p) => p.id === id);
    if (petIndex === -1) throw new Error('Not found in mock');
    const pet = petsDatabase[petIndex];
    Object.assign(pet, data);
    petsDatabase[petIndex] = pet;
    return pet;
  },
  async create() {
    return {} as Pet;
  },
  async findByOwnerId() {
    return [];
  },
  async delete() {},
};

let sut: UpdatePetUseCase;

describe('Update Pet Use Case', () => {
  const ownerA_Id = 'owner-A';
  const ownerB_Id = 'owner-B';
  const petFromA_Id = 'pet-from-A';

  beforeEach(() => {
    petsDatabase = [{ id: petFromA_Id, name: 'Bolinha', size: 'PEQUENO', ownerId: ownerA_Id }];
    sut = new UpdatePetUseCase(inMemoryPetRepository);
  });

  it('should be able to update a pet', async () => {
    const { pet } = await sut.execute({
      petId: petFromA_Id,
      ownerId: ownerA_Id,
      data: { name: 'Bolinha II' },
    });
    expect(pet.name).toBe('Bolinha II');
    expect(petsDatabase[0].name).toBe('Bolinha II');
  });

  it('should not be able to update a non-existent pet', async () => {
    await expect(
      sut.execute({ petId: 'non-existent-id', ownerId: ownerA_Id, data: {} }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to update a pet from another owner', async () => {
    await expect(
      sut.execute({ petId: petFromA_Id, ownerId: ownerB_Id, data: {} }),
    ).rejects.toBeInstanceOf(NotAuthorizedError);
  });
});
