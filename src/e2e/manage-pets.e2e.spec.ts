import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { prisma } from '@/infra/database/prisma/client';
import { hash } from 'bcryptjs';

describe('Manage Client Pets (E2E)', () => {
  const appUrl = 'http://localhost:3000';
  const clientAEmail = 'e2e.pet.client.a@example.com';
  const clientBEmail = 'e2e.pet.client.b@example.com';
  const password = 'password123';

  let tokenClientA: string;
  let tokenClientB: string;
  let petFromClientA_Id: string;

  beforeAll(async () => {
    await prisma.$connect();
    await prisma.clientUser.deleteMany({
      where: { email: { in: [clientAEmail, clientBEmail] } },
    });

    const passwordHash = await hash(password, 8);
    // Create Client A and B
    await prisma.clientUser.createMany({
      data: [
        { name: 'Client A', email: clientAEmail, password: passwordHash },
        { name: 'Client B', email: clientBEmail, password: passwordHash },
      ],
    });

    // Authenticate Client A
    const authResponseA = await request(appUrl)
      .post('/api/auth/client/login')
      .send({ email: clientAEmail, password });
    tokenClientA = authResponseA.body.accessToken;

    // Authenticate Client B
    const authResponseB = await request(appUrl)
      .post('/api/auth/client/login')
      .send({ email: clientBEmail, password });
    tokenClientB = authResponseB.body.accessToken;
  });

  afterAll(async () => {
    await prisma.clientUser.deleteMany({
      where: { email: { in: [clientAEmail, clientBEmail] } },
    });
    await prisma.$disconnect();
  });

  it('should be able to create a new pet for the authenticated client', async () => {
    const response = await request(appUrl)
      .post('/api/client/me/pets')
      .set('Authorization', `Bearer ${tokenClientA}`)
      .send({ name: 'Rex', size: 'MEDIO' });

    expect(response.status).toBe(201);
    expect(response.body.pet.name).toBe('Rex');
    petFromClientA_Id = response.body.pet.id;
  });

  it('should be able to list my own pets', async () => {
    const response = await request(appUrl)
      .get('/api/client/me/pets')
      .set('Authorization', `Bearer ${tokenClientA}`);

    expect(response.status).toBe(200);
    expect(response.body.pets).toHaveLength(1);
    expect(response.body.pets[0].name).toBe('Rex');
  });

  it('should be able to update my own pet', async () => {
    const response = await request(appUrl)
      .put(`/api/client/me/pets/${petFromClientA_Id}`)
      .set('Authorization', `Bearer ${tokenClientA}`)
      .send({ name: 'Rex Atualizado' });

    expect(response.status).toBe(200);
    expect(response.body.pet.name).toBe('Rex Atualizado');
  });

  it('should not be able to list pets from another client', async () => {
    const response = await request(appUrl)
      .get('/api/client/me/pets')
      .set('Authorization', `Bearer ${tokenClientB}`);

    expect(response.status).toBe(200);
    expect(response.body.pets).toHaveLength(0);
  });

  it('should not be able to update a pet from another client', async () => {
    const response = await request(appUrl)
      .put(`/api/client/me/pets/${petFromClientA_Id}`)
      .set('Authorization', `Bearer ${tokenClientB}`)
      .send({ name: 'Tentativa de Update' });

    expect(response.status).toBe(403);
  });

  it('should not be able to delete a pet from another client', async () => {
    const response = await request(appUrl)
      .delete(`/api/client/me/pets/${petFromClientA_Id}`)
      .set('Authorization', `Bearer ${tokenClientB}`);

    expect(response.status).toBe(403);
  });

  it('should be able to delete my own pet', async () => {
    const response = await request(appUrl)
      .delete(`/api/client/me/pets/${petFromClientA_Id}`)
      .set('Authorization', `Bearer ${tokenClientA}`);

    expect(response.status).toBe(204);

    const petInDb = await prisma.pet.findUnique({
      where: { id: petFromClientA_Id },
    });
    expect(petInDb).toBeNull();
  });
});
