import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { prisma } from '@/infra/database/prisma/client';
import { hash } from 'bcryptjs';

describe('Service Management (E2E)', () => {
  const appUrl = 'http://localhost:3000';
  let tokenUserA: string;
  let tokenUserB: string;
  let petShopA_Id: string;
  let petShopB_Id: string;
  let serviceFromA_Id: string;

  beforeAll(async () => {
    await prisma.$connect();

    await prisma.petShopUser.deleteMany({ where: { email: { contains: 'e2e.service@' } } });
    await prisma.petShop.deleteMany({ where: { name: { contains: 'E2E Service Test' } } });

    const petShopA = await prisma.petShop.create({
      data: { name: 'PetShop A - E2E Service Test' },
    });
    petShopA_Id = petShopA.id;
    const userA = await prisma.petShopUser.create({
      data: {
        name: 'User A',
        email: 'e2e.service.a@example.com',
        password: await hash('password123', 8),
        role: 'OWNER',
        petShopId: petShopA_Id,
      },
    });

    const petShopB = await prisma.petShop.create({
      data: { name: 'PetShop B - E2E Service Test' },
    });
    petShopB_Id = petShopB.id;
    const userB = await prisma.petShopUser.create({
      data: {
        name: 'User B',
        email: 'e2e.service.b@example.com',
        password: await hash('password123', 8),
        role: 'OWNER',
        petShopId: petShopB_Id,
      },
    });

    const authResponseA = await request(appUrl)
      .post('/api/auth/petshop/login')
      .send({ email: userA.email, password: 'password123' });
    tokenUserA = authResponseA.body.accessToken;

    const authResponseB = await request(appUrl)
      .post('/api/auth/petshop/login')
      .send({ email: userB.email, password: 'password123' });
    tokenUserB = authResponseB.body.accessToken;
  });

  afterAll(async () => {
    await prisma.petShopUser.deleteMany({ where: { email: { contains: 'e2e.service@' } } });
    await prisma.petShop.deleteMany({ where: { id: { in: [petShopA_Id, petShopB_Id] } } });
    await prisma.$disconnect();
  });

  it('should be able to create and list a service for its own petshop', async () => {
    const createResponse = await request(appUrl)
      .post('/api/petshops/me/services')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ name: 'Banho Terapêutico', duration: 90, price: 120.5 });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.service.name).toEqual('Banho Terapêutico');
    serviceFromA_Id = createResponse.body.service.id;

    const listResponse = await request(appUrl)
      .get('/api/petshops/me/services')
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.services).toHaveLength(1);
    expect(listResponse.body.services[0].id).toEqual(serviceFromA_Id);
  });

  it('should not be able to list services from another petshop', async () => {
    const listResponse = await request(appUrl)
      .get('/api/petshops/me/services')
      .set('Authorization', `Bearer ${tokenUserB}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.services).toHaveLength(0);
  });

  it('should not be able to update a service from another petshop', async () => {
    const updateResponse = await request(appUrl)
      .put(`/api/petshops/me/services/${serviceFromA_Id}`)
      .set('Authorization', `Bearer ${tokenUserB}`)
      .send({ name: 'TENTATIVA DE HACK' });

    expect(updateResponse.status).toBe(403);
  });

  it('should not be able to delete a service from another petshop', async () => {
    const deleteResponse = await request(appUrl)
      .delete(`/api/petshops/me/services/${serviceFromA_Id}`)
      .set('Authorization', `Bearer ${tokenUserB}`);

    expect(deleteResponse.status).toBe(403);

    const service = await prisma.service.findUnique({ where: { id: serviceFromA_Id } });
    expect(service).not.toBeNull();
  });
});
