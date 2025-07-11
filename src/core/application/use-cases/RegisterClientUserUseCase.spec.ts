import { describe, it, expect, beforeEach } from 'vitest';
import { RegisterClientUserUseCase } from './RegisterClientUserUseCase';
import { IClientUserRepository } from '@/core/domain/repositories/IClientUserRepository';
import { ClientUser } from '@prisma/client';
import { UserAlreadyExistsError } from './errors/UserAlreadyExistsError';
import { CreateClientUserData } from '@/core/domain/repositories/IClientUserRepository';

// --- Mock do Repositório de ClientUser ---
let usersDatabase: ClientUser[] = [];
const inMemoryClientUserRepository: IClientUserRepository = {
  async findByEmail(email: string) {
    const user = usersDatabase.find((user) => user.email === email);
    return user || null;
  },
  async create(data: CreateClientUserData) {
    const newUser: ClientUser = {
      id: `client-user-${usersDatabase.length + 1}`,
      name: data.name,
      email: data.email,
      password: data.password, // Recebe a senha já com hash do caso de uso
    };
    usersDatabase.push(newUser);
    return newUser;
  },
};
// --- Fim do Mock ---

let sut: RegisterClientUserUseCase;

describe('Register Client User Use Case', () => {
  beforeEach(() => {
    usersDatabase = []; // Limpa a "base de dados" antes de cada teste
    sut = new RegisterClientUserUseCase(inMemoryClientUserRepository);
  });

  it('should be able to register a new client user', async () => {
    const { user } = await sut.execute({
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      password: 'password123',
    });

    expect(user.id).toEqual(expect.any(String));
    expect(usersDatabase.length).toBe(1);
    expect(usersDatabase[0].name).toEqual('Jane Doe');
  });

  it('should hash the user password upon registration', async () => {
    const { user } = await sut.execute({
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      password: 'password123',
    });

    expect(user.password).not.toEqual('password123');
  });

  it('should not be able to register with an existing email', async () => {
    const email = 'janedoe@example.com';

    // Primeiro, regista um usuário com este e-mail
    await sut.execute({
      name: 'Jane Doe',
      email: email,
      password: 'password123',
    });

    // Depois, verifica se uma segunda tentativa com o mesmo e-mail lança o erro correto
    await expect(() =>
      sut.execute({
        name: 'Another User',
        email: email,
        password: 'password456',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });
});
