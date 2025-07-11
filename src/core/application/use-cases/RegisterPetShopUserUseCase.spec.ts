import { describe, it, expect, beforeEach } from 'vitest';
import { RegisterPetShopUserUseCase } from './RegisterPetShopUserUseCase';
import { IPetShopUserRepository } from '@/core/domain/repositories/IPetShopUserRepository';
import { PetShopUser, Role } from '@prisma/client';
import { UserAlreadyExistsError } from './errors/UserAlreadyExistsError';
import { CreatePetShopUserData } from '@/core/domain/repositories/IPetShopUserRepository';

// --- Mock (Simulação) do nosso Repositório ---
// Vamos criar uma implementação falsa em memória para usar nos testes.
let usersDatabase: PetShopUser[] = [];
const inMemoryPetShopUserRepository: IPetShopUserRepository = {
  async findByEmail(email: string) {
    const user = usersDatabase.find((user) => user.email === email);
    return user || null;
  },
  async create(data: CreatePetShopUserData) {
    const newUser: PetShopUser = {
      id: `user-${usersDatabase.length + 1}`,
      name: data.name,
      email: data.email,
      password: data.password, // No teste, recebemos o hash do caso de uso
      role: data.role as Role,
      petShopId: data.petShopId,
    };
    usersDatabase.push(newUser);
    return newUser;
  },
};
// --- Fim do Mock ---

// "SUT" é uma sigla comum em testes que significa "System Under Test" (Sistema Sob Teste)
let sut: RegisterPetShopUserUseCase;

describe('Register PetShop User Use Case', () => {
  // O 'beforeEach' é uma função do Vitest que é executada antes de cada teste ('it').
  // Usamo-la para garantir que cada teste começa com um "ambiente limpo".
  beforeEach(() => {
    usersDatabase = []; // Limpa a nossa base de dados em memória
    sut = new RegisterPetShopUserUseCase(inMemoryPetShopUserRepository); // Cria uma nova instância do caso de uso
  });

  it('should be able to register a new petshop user', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'password123',
      role: Role.OWNER,
      petShopId: 'petshop-01',
    });

    // 'expect' é onde fazemos as nossas asserções (verificações)
    expect(user.id).toEqual(expect.any(String)); // Esperamos que o usuário tenha um ID (qualquer string)
    expect(usersDatabase.length).toBe(1); // Esperamos que o usuário tenha sido salvo na nossa base de dados falsa
    expect(usersDatabase[0].name).toEqual('John Doe');
  });

  it('should hash the user password upon registration', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'password123',
      role: Role.OWNER,
      petShopId: 'petshop-01',
    });

    // Verificamos que a senha guardada na "base de dados" NÃO É a senha original
    expect(user.password).not.toEqual('password123');
  });

  it('should not be able to register with an existing email', async () => {
    const email = 'johndoe@example.com';

    // Primeiro, registamos um usuário com um e-mail específico
    await sut.execute({
      name: 'John Doe',
      email: email,
      password: 'password123',
      role: Role.OWNER,
      petShopId: 'petshop-01',
    });

    // Depois, esperamos que a tentativa de registrar com o MESMO e-mail seja rejeitada
    // e que o erro seja uma instância do nosso erro customizado.
    await expect(() =>
      sut.execute({
        name: 'Jane Doe',
        email: email, // mesmo e-mail
        password: 'password456',
        role: 'EMPLOYEE',
        petShopId: 'petshop-02',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });
});
