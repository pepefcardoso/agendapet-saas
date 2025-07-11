import { describe, it, expect, beforeEach } from 'vitest';
import { AuthenticateClientUserUseCase } from './AuthenticateClientUserUseCase';
import { IClientUserRepository } from '@/core/domain/repositories/IClientUserRepository';
import { JwtService } from '@/infra/providers/JwtService';
import { ClientUser } from '@prisma/client';
import { hash } from 'bcryptjs';
import { InvalidCredentialsError } from './errors/InvalidCredentialsError';

// --- Mocks ---
let usersDatabase: ClientUser[] = [];
let inMemoryClientUserRepository: IClientUserRepository;
let jwtService: JwtService;
let sut: AuthenticateClientUserUseCase;

describe('Authenticate Client User Use Case', () => {
  beforeEach(async () => {
    usersDatabase = [];

    // Mock do repositório de Cliente
    inMemoryClientUserRepository = {
      findByEmail: async (email) => usersDatabase.find((user) => user.email === email) || null,
      create: async () => ({}) as ClientUser, // Não usado neste teste
    };

    // Mock do serviço de JWT
    jwtService = {
      sign: (payload) => `fake-jwt-token-for-${payload.sub}`,
    } as JwtService;

    sut = new AuthenticateClientUserUseCase(inMemoryClientUserRepository, jwtService);

    // Criar um usuário de teste na nossa base de dados em memória
    const passwordHash = await hash('password123', 8);
    usersDatabase.push({
      id: 'client-user-01',
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: passwordHash,
    });
  });

  it('should be able to authenticate', async () => {
    const { accessToken } = await sut.execute({
      email: 'jane@example.com',
      password: 'password123',
    });

    expect(accessToken).toEqual(expect.any(String));
    expect(accessToken).toContain('fake-jwt-token-for-client-user-01');
  });

  it('should not be able to authenticate with wrong email', async () => {
    await expect(() =>
      sut.execute({
        email: 'wrong-email@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('should not be able to authenticate with wrong password', async () => {
    await expect(() =>
      sut.execute({
        email: 'jane@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
