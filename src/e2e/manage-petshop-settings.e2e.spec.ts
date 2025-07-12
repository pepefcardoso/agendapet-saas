import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { prisma } from '@/infra/database/prisma/client';
import { hash } from 'bcryptjs';

describe('Manage PetShop Settings (E2E)', () => {
  const appUrl = 'http://localhost:3000';
  const userEmail = 'manage.settings.e2e@example.com';
  const userPassword = 'password123';
  let accessToken: string;
  let createdPetShopId: string;

  beforeAll(async () => {
    await prisma.$connect();
    await prisma.petShopUser.deleteMany({ where: { email: userEmail } });

    const petshop = await prisma.petShop.create({
      data: { name: 'PetShop To Manage' },
    });
    createdPetShopId = petshop.id;

    const passwordHash = await hash(userPassword, 8);
    await prisma.petShopUser.create({
      data: {
        name: 'Manager E2E User',
        email: userEmail,
        password: passwordHash,
        role: 'OWNER',
        petShopId: createdPetShopId,
      },
    });

    const authResponse = await request(appUrl)
      .post('/api/auth/petshop/login')
      .send({ email: userEmail, password: userPassword });

    accessToken = authResponse.body.accessToken;
  });

  afterAll(async () => {
    await prisma.petShopUser.deleteMany({ where: { email: userEmail } });
    await prisma.petShop.delete({ where: { id: createdPetShopId } });
    await prisma.$disconnect();
  });

  it('should be able to get authenticated petshop profile', async () => {
    const response = await request(appUrl)
      .get('/api/petshops/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.petShop.id).toBe(createdPetShopId);
    expect(response.body.petShop.name).toBe('PetShop To Manage');
  });

  it('should be able to update petshop settings', async () => {
    const response = await request(appUrl)
      .put('/api/petshops/me/settings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Updated PetShop Name',
        address: '123 Updated St',
      });

    expect(response.status).toBe(200);
    expect(response.body.petShop.name).toBe('Updated PetShop Name');
    expect(response.body.petShop.address).toBe('123 Updated St');

    const petShopInDb = await prisma.petShop.findUnique({
      where: { id: createdPetShopId },
    });
    expect(petShopInDb?.name).toBe('Updated PetShop Name');
  });
});
