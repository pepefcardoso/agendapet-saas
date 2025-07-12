import { describe, it, expect, beforeEach } from 'vitest';
import { RegisterPetShopUserUseCase } from './RegisterPetShopUserUseCase';
import { IPetShopUserRepository } from '@/core/domain/repositories/IPetShopUserRepository';
import { IPetShopRepository } from '@/core/domain/repositories/IPetShopRepository';
import { PetShopUser, Role, PetShop } from '@prisma/client';
import { UserAlreadyExistsError } from './errors/UserAlreadyExistsError';
import { CreatePetShopUserData } from '@/core/domain/repositories/IPetShopUserRepository';
import { CreatePetShopData } from '@/core/domain/repositories/IPetShopRepository';

let petShopUsersDatabase: PetShopUser[] = [];
let petShopsDatabase: PetShop[] = [];

const inMemoryPetShopUserRepository: IPetShopUserRepository = {
  async findByEmail(email: string) {
    return petShopUsersDatabase.find((user) => user.email === email) || null;
  },
  async create(data: CreatePetShopUserData) {
    const newUser: PetShopUser = {
      id: `user-${petShopUsersDatabase.length + 1}`,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role as Role,
      petShopId: data.petShopId,
    };
    petShopUsersDatabase.push(newUser);
    return newUser;
  },
};

const inMemoryPetShopRepository: IPetShopRepository = {
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
  async findById() {
    return null;
  },
  async update() {
    return {} as PetShop;
  },
};

let sut: RegisterPetShopUserUseCase;

describe('Register PetShop User Use Case', () => {
  beforeEach(() => {
    petShopUsersDatabase = [];
    petShopsDatabase = [];
    sut = new RegisterPetShopUserUseCase(inMemoryPetShopUserRepository, inMemoryPetShopRepository);
  });

  it('should be able to register a new petshop and its owner', async () => {
    const { user } = await sut.execute({
      petShopName: 'Happy Paws',
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'password123',
    });

    expect(user.id).toEqual(expect.any(String));
    expect(user.role).toBe(Role.OWNER);
    expect(petShopUsersDatabase.length).toBe(1);
    expect(petShopUsersDatabase[0].name).toBe('John Doe');

    expect(petShopsDatabase.length).toBe(1);
    expect(petShopsDatabase[0].name).toBe('Happy Paws');

    expect(user.petShopId).toBe(petShopsDatabase[0].id);
  });

  it('should not be able to register with an existing email', async () => {
    const email = 'johndoe@example.com';

    await sut.execute({
      petShopName: 'Happy Paws',
      name: 'John Doe',
      email: email,
      password: 'password123',
    });

    await expect(() =>
      sut.execute({
        petShopName: 'Sad Paws',
        name: 'Jane Doe',
        email: email,
        password: 'password456',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });
});
