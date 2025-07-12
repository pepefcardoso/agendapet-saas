import { describe, it, expect, beforeEach } from 'vitest';
import { ListPetShopClientsUseCase } from './ListPetShopClientsUseCase';
import { IPetShopClientRepository } from '@/core/domain/repositories/IPetShopClientRepository';
import { ClientUser, PetShopClient } from '@prisma/client';

let clientUsersDatabase: ClientUser[] = [];
let petShopClientsDatabase: PetShopClient[] = [];

const inMemoryPetShopClientRepository: IPetShopClientRepository = {
  async listByPetShopId(petShopId: string) {
    const clientIds = petShopClientsDatabase
      .filter((link) => link.petShopId === petShopId)
      .map((link) => link.clientId);
    return clientUsersDatabase.filter((user) => clientIds.includes(user.id));
  },
  link: async () => ({}) as PetShopClient,
  findByPetShopAndClient: async () => null,
};

let sut: ListPetShopClientsUseCase;

describe('List PetShop Clients Use Case', () => {
  beforeEach(() => {
    clientUsersDatabase = [];
    petShopClientsDatabase = [];
    sut = new ListPetShopClientsUseCase(inMemoryPetShopClientRepository);

    const client1 = { id: 'client-1', name: 'Client A', email: 'a@a.com', password: '...' };
    const client2 = { id: 'client-2', name: 'Client B', email: 'b@b.com', password: '...' };
    const client3 = { id: 'client-3', name: 'Client C', email: 'c@c.com', password: '...' };
    clientUsersDatabase.push(client1, client2, client3);

    petShopClientsDatabase.push({ petShopId: 'petshop-01', clientId: 'client-1' });
    petShopClientsDatabase.push({ petShopId: 'petshop-01', clientId: 'client-2' });

    petShopClientsDatabase.push({ petShopId: 'petshop-02', clientId: 'client-3' });
  });

  it('should be able to list the clients of a specific petshop', async () => {
    const { clients } = await sut.execute({ petShopId: 'petshop-01' });

    expect(clients.length).toBe(2);
    expect(clients[0].name).toEqual('Client A');
    expect(clients[1].name).toEqual('Client B');
  });

  it('should return an empty array if a petshop has no clients', async () => {
    const { clients } = await sut.execute({ petShopId: 'petshop-03-empty' });

    expect(clients.length).toBe(0);
  });
});
