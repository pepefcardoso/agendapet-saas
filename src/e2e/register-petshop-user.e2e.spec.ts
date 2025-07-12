import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { prisma } from '@/infra/database/prisma/client';

describe('Register PetShop User (E2E)', () => {
  const appUrl = 'http://localhost:3000';
  const testUserEmail = 'e2e.register.user@example.com';
  const testPetShopName = 'PetShop Register E2E Test';

  beforeAll(async () => {
    await prisma.$connect();
    await prisma.petShopUser.deleteMany({ where: { email: testUserEmail } });
    await prisma.petShop.deleteMany({ where: { name: testPetShopName } });
  });

  afterAll(async () => {
    await prisma.petShopUser.deleteMany({ where: { email: testUserEmail } });
    await prisma.petShop.deleteMany({ where: { name: testPetShopName } });
    await prisma.$disconnect();
  });

  it('should be able to register a new petshop and its owner', async () => {
    const response = await request(appUrl).post('/api/auth/petshop/register').send({
      petShopName: testPetShopName,
      name: 'E2E Test Owner',
      email: testUserEmail,
      password: 'password123',
    });

    if (response.status !== 201) {
      console.error('API Response Body on Failure (Register Test):', response.body);
    }

    expect(response.status).toBe(201);

    const petshopInDb = await prisma.petShop.findFirst({
      where: { name: testPetShopName },
    });
    const userInDb = await prisma.petShopUser.findUnique({
      where: { email: testUserEmail },
    });

    expect(petshopInDb).not.toBeNull();
    expect(userInDb).not.toBeNull();
    expect(userInDb?.petShopId).toBe(petshopInDb?.id);
    expect(userInDb?.role).toBe('OWNER');
  });

  it('should not be able to register with an existing email', async () => {
    const response = await request(appUrl).post('/api/auth/petshop/register').send({
      petShopName: 'Another PetShop',
      name: 'Another E2E User',
      email: testUserEmail,
      password: 'password456',
    });

    if (response.status !== 409) {
      console.error('API Response Body on Failure (Conflict Test):', response.body);
    }

    expect(response.status).toBe(409);
  });
});
