import { describe, it, expect, beforeEach } from 'vitest';
import { AuthenticatePetShopUserUseCase } from './AuthenticatePetShopUserUseCase';
import { IPetShopUserRepository } from '@/core/domain/repositories/IPetShopUserRepository';
import { JwtService } from '@/infra/providers/JwtService';
import { PetShopUser, Role } from '@prisma/client';
import { hash } from 'bcryptjs';
import { InvalidCredentialsError } from './errors/InvalidCredentialsError';

// --- Mocks ---
let usersDatabase: PetShopUser[] = [];
let inMemoryPetShopUserRepository: IPetShopUserRepository;
let jwtService: JwtService;
let sut: AuthenticatePetShopUserUseCase;

describe('Authenticate PetShop User Use Case', () => {
  beforeEach(async () => {
    // Limpa a base de dados em memória
    usersDatabase = [];

    // Mock do repositório (não precisamos da função 'create' neste teste)
    inMemoryPetShopUserRepository = {
      findByEmail: async (email) => usersDatabase.find((user) => user.email === email) || null,
      create: async () => ({}) as PetShopUser, // Função vazia, apenas para satisfazer a interface
    };

    // Mock simples do JwtService
    jwtService = {
      sign: (payload) => `fake-jwt-token-for-${payload.sub}`,
    } as JwtService; // Usamos 'as' para forçar a tipagem do nosso mock simplificado

    sut = new AuthenticatePetShopUserUseCase(inMemoryPetShopUserRepository, jwtService);

    // Para testar o login, precisamos de um usuário pré-existente.
    // Vamos criá-lo diretamente na nossa base de dados em memória.
    const passwordHash = await hash('password123', 8);
    usersDatabase.push({
      id: 'user-01',
      name: 'Test User',
      email: 'test@example.com',
      password: passwordHash,
      role: Role.OWNER,
      petShopId: 'petshop-01',
    });
  });

  it('should be able to authenticate', async () => {
    const { accessToken } = await sut.execute({
      email: 'test@example.com',
      password: 'password123',
    });

    // Verificamos que o token foi retornado e é uma string
    expect(accessToken).toEqual(expect.any(String));
    // Verificamos que o nosso mock do jwtService foi chamado corretamente
    expect(accessToken).toContain('fake-jwt-token-for-user-01');
  });

  it('should not be able to authenticate with wrong email', async () => {
    // Esperamos que a execução com um e-mail inválido seja rejeitada com o erro correto
    await expect(() =>
      sut.execute({
        email: 'wrong-email@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('should not be able to authenticate with wrong password', async () => {
    // Esperamos que a execução com uma senha inválida seja rejeitada com o erro correto
    await expect(() =>
      sut.execute({
        email: 'test@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
