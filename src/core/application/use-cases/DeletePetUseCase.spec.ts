import { describe, it, expect, beforeEach } from 'vitest';
import { DeletePetUseCase } from './DeletePetUseCase';
import { IPetRepository } from '@/core/domain/repositories/IPetRepository';
import { Pet } from '@prisma/client';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';
import { NotAuthorizedError } from './errors/NotAuthorizedError';

let petsDatabase: Pet[] = [];
const inMemoryPetRepository: IPetRepository = {
  async findById(id) {
    return petsDatabase.find((p) => p.id === id) || null;
  },
  async delete(id) {
    petsDatabase = petsDatabase.filter((p) => p.id !== id);
  },
  async create(data) {
    const newPet: Pet = { id: `pet-${petsDatabase.length + 1}`, ...data } as Pet;
    petsDatabase.push(newPet);
    return newPet;
  },
  async findByOwnerId() {
    return [];
  },
  async update() {
    return {} as Pet;
  },
};

let sut: DeletePetUseCase;

describe('Delete Pet Use Case', () => {
  const ownerA_Id = 'owner-A';
  const ownerB_Id = 'owner-B';
  const petFromA_Id = 'pet-from-A';

  beforeEach(() => {
    petsDatabase = [{ id: petFromA_Id, name: 'Bolinha', size: 'PEQUENO', ownerId: ownerA_Id }];
    sut = new DeletePetUseCase(inMemoryPetRepository);
  });

  it('should be able to delete a pet', async () => {
    await sut.execute({ petId: petFromA_Id, ownerId: ownerA_Id });
    expect(petsDatabase.length).toBe(0);
  });

  it('should not be able to delete a non-existent pet', async () => {
    await expect(
      sut.execute({ petId: 'non-existent-id', ownerId: ownerA_Id }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to delete a pet from another owner', async () => {
    await expect(sut.execute({ petId: petFromA_Id, ownerId: ownerB_Id })).rejects.toBeInstanceOf(
      NotAuthorizedError,
    );
  });
});
