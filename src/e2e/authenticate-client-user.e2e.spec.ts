import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { prisma } from '@/infra/database/prisma/client';
import { hash } from 'bcryptjs';

describe('Authenticate Client User (E2E)', () => {
  const appUrl = 'http://localhost:3000';
  const userEmail = 'auth.client.e2e@example.com';
  const userPassword = 'password123';

  beforeAll(async () => {
    await prisma.$connect();

    // Limpar dados de testes anteriores
    await prisma.clientUser.deleteMany({ where: { email: userEmail } });

    // Criar um usuário cliente diretamente no banco
    const passwordHash = await hash(userPassword, 8);
    await prisma.clientUser.create({
      data: {
        name: 'Client Auth E2E User',
        email: userEmail,
        password: passwordHash,
      },
    });
  });

  afterAll(async () => {
    // Limpar os dados criados
    await prisma.clientUser.deleteMany({ where: { email: userEmail } });
    await prisma.$disconnect();
  });

  it('should be able to authenticate a client user', async () => {
    const response = await request(appUrl).post('/api/auth/client/login').send({
      email: userEmail,
      password: userPassword,
    });

    if (response.status !== 200) {
      console.error('API Response Body on Failure (Client Login Success Test):', response.body);
    }

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.accessToken).toEqual(expect.any(String));
  });

  it('should not be able to authenticate with wrong email', async () => {
    const response = await request(appUrl).post('/api/auth/client/login').send({
      email: 'wrong.email@example.com',
      password: userPassword,
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Invalid credentials.');
  });
});
