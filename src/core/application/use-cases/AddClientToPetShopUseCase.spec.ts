import { describe, it, expect, beforeEach } from 'vitest';
import { AddClientToPetShopUseCase } from './AddClientToPetShopUseCase';
import { IClientUserRepository } from '@/core/domain/repositories/IClientUserRepository';
import { IPetShopClientRepository } from '@/core/domain/repositories/IPetShopClientRepository';
import { ClientUser, PetShopClient } from '@prisma/client';
import { ClientAlreadyLinkedError } from './errors/ClientAlreadyLinkedError';

let clientUsersDatabase: ClientUser[] = [];
let petShopClientsDatabase: PetShopClient[] = [];

const inMemoryClientUserRepository: IClientUserRepository = {
  async findByEmail(email: string) {
    return clientUsersDatabase.find((user) => user.email === email) || null;
  },
  async create(data) {
    const newUser: ClientUser = {
      id: `client-user-${clientUsersDatabase.length + 1}`,
      name: data.name,
      email: data.email,
      password: data.password,
    };
    clientUsersDatabase.push(newUser);
    return newUser;
  },
};

const inMemoryPetShopClientRepository: IPetShopClientRepository = {
  async link(petShopId, clientId) {
    const newLink: PetShopClient = { petShopId, clientId };
    petShopClientsDatabase.push(newLink);
    return newLink;
  },
  async findByPetShopAndClient(petShopId, clientId) {
    return (
      petShopClientsDatabase.find(
        (link) => link.petShopId === petShopId && link.clientId === clientId,
      ) || null
    );
  },
  async listByPetShopId(petShopId: string) {
    const clientIds = petShopClientsDatabase
      .filter((link) => link.petShopId === petShopId)
      .map((link) => link.clientId);
    return clientUsersDatabase.filter((user) => clientIds.includes(user.id));
  },
};

let sut: AddClientToPetShopUseCase;

describe('Add Client To PetShop Use Case', () => {
  beforeEach(() => {
    clientUsersDatabase = [];
    petShopClientsDatabase = [];
    sut = new AddClientToPetShopUseCase(
      inMemoryClientUserRepository,
      inMemoryPetShopClientRepository,
    );
  });

  it('should be able to add a new client to a petshop', async () => {
    const petShopId = 'petshop-01';
    const clientEmail = 'new.client@example.com';

    await sut.execute({
      name: 'New Client',
      email: clientEmail,
      petShopId,
    });

    expect(clientUsersDatabase.length).toBe(1);
    expect(clientUsersDatabase[0].email).toBe(clientEmail);
    expect(clientUsersDatabase[0].password).not.toBe('some-random-uuid');

    expect(petShopClientsDatabase.length).toBe(1);
    expect(petShopClientsDatabase[0].petShopId).toBe(petShopId);
    expect(petShopClientsDatabase[0].clientId).toBe(clientUsersDatabase[0].id);
  });

  it('should be able to link an existing client to a petshop', async () => {
    const existingClient = await inMemoryClientUserRepository.create({
      id: 'existing-client-id',
      name: 'Existing Client',
      email: 'existing.client@example.com',
      password: 'hashed-password',
    });

    const petShopId = 'petshop-02';

    await sut.execute({
      name: 'Existing Client',
      email: existingClient.email,
      petShopId,
    });

    expect(clientUsersDatabase.length).toBe(1);

    expect(petShopClientsDatabase.length).toBe(1);
    expect(petShopClientsDatabase[0].petShopId).toBe(petShopId);
    expect(petShopClientsDatabase[0].clientId).toBe(existingClient.id);
  });

  it('should not be able to link a client that is already linked', async () => {
    const petShopId = 'petshop-01';
    const clientEmail = 'client@example.com';

    await sut.execute({
      name: 'Client',
      email: clientEmail,
      petShopId,
    });

    await expect(() =>
      sut.execute({
        name: 'Client',
        email: clientEmail,
        petShopId,
      }),
    ).rejects.toBeInstanceOf(ClientAlreadyLinkedError);
  });
});
