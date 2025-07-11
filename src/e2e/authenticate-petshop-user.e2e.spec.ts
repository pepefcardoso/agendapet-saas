import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { prisma } from '@/infra/database/prisma/client';
import { hash } from 'bcryptjs';

describe('Authenticate PetShop User (E2E)', () => {
  const appUrl = 'http://localhost:3000';
  let createdPetShopId: string;
  const userEmail = 'auth.petshop.e2e@example.com';
  const userPassword = 'password123';

  beforeAll(async () => {
    // Garantir que a aplicação está rodando em outro terminal
    await prisma.$connect();

    // Limpar tabelas para um ambiente de teste limpo
    await prisma.petShopUser.deleteMany({ where: { email: userEmail } });
    await prisma.petShop.deleteMany({ where: { name: 'PetShop Auth E2E Test' } });

    // Criar PetShop necessário para o usuário
    const petshop = await prisma.petShop.create({
      data: {
        name: 'PetShop Auth E2E Test',
      },
    });
    createdPetShopId = petshop.id;

    // Criar um usuário diretamente no banco para o teste de login
    const passwordHash = await hash(userPassword, 8);
    await prisma.petShopUser.create({
      data: {
        name: 'Auth E2E User',
        email: userEmail,
        password: passwordHash,
        role: 'OWNER',
        petShopId: createdPetShopId,
      },
    });
  });

  afterAll(async () => {
    // Limpar os dados criados durante os testes
    await prisma.petShopUser.deleteMany({ where: { email: userEmail } });
    await prisma.petShop.deleteMany({ where: { id: createdPetShopId } });
    await prisma.$disconnect();
  });

  it('should be able to authenticate a petshop user', async () => {
    const response = await request(appUrl).post('/api/auth/petshop/login').send({
      email: userEmail,
      password: userPassword,
    });

    if (response.status !== 200) {
      console.error('API Response Body on Failure (Login Success Test):', response.body);
    }

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.accessToken).toEqual(expect.any(String));
  });

  it('should not be able to authenticate with wrong password', async () => {
    const response = await request(appUrl).post('/api/auth/petshop/login').send({
      email: userEmail,
      password: 'wrong-password',
    });

    expect(response.status).toBe(401); // Unauthorized
    expect(response.body.message).toEqual('Invalid credentials.');
  });
});
