import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { prisma } from '@/infra/database/prisma/client';

describe('Register PetShop User (E2E)', () => {
  const appUrl = 'http://localhost:3000';
  let createdPetShopId: string;
  const testUserEmail = 'e2e.register.user@example.com'; // E-mail único para este arquivo

  beforeAll(async () => {
    await prisma.$connect();
    // Limpa dados de execuções anteriores para garantir um início limpo
    await prisma.petShopUser.deleteMany({ where: { email: testUserEmail } });
    await prisma.petShop.deleteMany({ where: { name: 'PetShop Register E2E Test' } });

    // Cria o PetShop necessário para os testes neste arquivo
    const petshop = await prisma.petShop.create({
      data: {
        name: 'PetShop Register E2E Test',
      },
    });
    createdPetShopId = petshop.id;
  });

  afterAll(async () => {
    // Limpa apenas os dados criados por este arquivo de teste
    await prisma.petShopUser.deleteMany({ where: { email: testUserEmail } });
    await prisma.petShop.deleteMany({ where: { id: createdPetShopId } });
    await prisma.$disconnect();
  });

  it('should be able to register a new petshop user', async () => {
    const response = await request(appUrl).post('/api/auth/petshop/register').send({
      name: 'E2E Test User',
      email: testUserEmail,
      password: 'password123',
      role: 'OWNER',
      petShopId: createdPetShopId,
    });

    if (response.status !== 201) {
      console.error('API Response Body on Failure (Register Test):', response.body);
    }
    expect(response.status).toBe(201);
  });

  it('should not be able to register with an existing email', async () => {
    // Este teste depende do usuário criado no teste anterior.
    // Agora, tentamos registrar um novo usuário com o mesmo e-mail via API.
    const response = await request(appUrl).post('/api/auth/petshop/register').send({
      name: 'Another E2E User',
      email: testUserEmail, // E-mail duplicado
      password: 'password456',
      role: 'EMPLOYEE',
      petShopId: createdPetShopId,
    });

    if (response.status !== 409) {
      console.error('API Response Body on Failure (Conflict Test):', response.body);
    }

    // A API deve retornar 409 (Conflict)
    expect(response.status).toBe(409);
  });
});
