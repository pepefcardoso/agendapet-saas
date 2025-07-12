import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { prisma } from '@/infra/database/prisma/client';
import { hash } from 'bcryptjs';

describe('Manage PetShop Clients (E2E)', () => {
  const appUrl = 'http://localhost:3000';
  const petshopUserEmail = 'manage.clients.e2e@example.com';
  const petshopName = 'PetShop Client Management E2E';
  let accessToken: string;
  let petShopId: string;

  beforeAll(async () => {
    await prisma.$connect();
    await prisma.petShopUser.deleteMany({ where: { email: petshopUserEmail } });
    await prisma.petShop.deleteMany({ where: { name: petshopName } });
    await prisma.clientUser.deleteMany({
      where: { email: { contains: 'e2e.client.manage@' } },
    });

    const petshop = await prisma.petShop.create({ data: { name: petshopName } });
    petShopId = petshop.id;

    await prisma.petShopUser.create({
      data: {
        name: 'Manager E2E User',
        email: petshopUserEmail,
        password: await hash('password123', 8),
        role: 'OWNER',
        petShopId,
      },
    });

    const authResponse = await request(appUrl)
      .post('/api/auth/petshop/login')
      .send({ email: petshopUserEmail, password: 'password123' });
    accessToken = authResponse.body.accessToken;
  });

  afterAll(async () => {
    await prisma.petShopUser.deleteMany({ where: { email: petshopUserEmail } });
    await prisma.petShop.deleteMany({ where: { name: petshopName } });
    await prisma.clientUser.deleteMany({
      where: { email: { contains: 'e2e.client.manage@' } },
    });
    await prisma.$disconnect();
  });

  it('should be able to add a new client to the petshop', async () => {
    const response = await request(appUrl)
      .post('/api/petshops/me/clients')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Brand New Client',
        email: 'e2e.client.manage.new@example.com',
      });

    expect(response.status).toBe(201);

    const clientInDb = await prisma.clientUser.findUnique({
      where: { email: 'e2e.client.manage.new@example.com' },
    });
    expect(clientInDb).not.toBeNull();

    const linkInDb = await prisma.petShopClient.findUnique({
      where: {
        petShopId_clientId: {
          petShopId,
          clientId: clientInDb!.id,
        },
      },
    });
    expect(linkInDb).not.toBeNull();
  });

  it('should be able to link an existing client to the petshop', async () => {
    const existingClient = await prisma.clientUser.create({
      data: {
        name: 'Pre-existing Client',
        email: 'e2e.client.manage.existing@example.com',
        password: await hash('password', 8),
      },
    });

    const response = await request(appUrl)
      .post('/api/petshops/me/clients')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Pre-existing Client',
        email: existingClient.email,
      });

    expect(response.status).toBe(201);

    const linkInDb = await prisma.petShopClient.findUnique({
      where: {
        petShopId_clientId: {
          petShopId,
          clientId: existingClient.id,
        },
      },
    });
    expect(linkInDb).not.toBeNull();
  });

  it('should not be able to add a client that is already linked', async () => {
    const response = await request(appUrl)
      .post('/api/petshops/me/clients')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Brand New Client',
        email: 'e2e.client.manage.new@example.com',
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toEqual('Client is already linked to this pet shop.');
  });

  it('should be able to list all linked clients', async () => {
    const response = await request(appUrl)
      .get('/api/petshops/me/clients')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.clients).toBeInstanceOf(Array);
    expect(response.body.clients.length).toBe(2);

    const clientEmails = response.body.clients.map((c: any) => c.email);
    expect(clientEmails).toContain('e2e.client.manage.new@example.com');
    expect(clientEmails).toContain('e2e.client.manage.existing@example.com');
  });
});
