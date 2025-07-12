import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { prisma } from '@/infra/database/prisma/client';
import { hash } from 'bcryptjs';

describe('Appointment Management (E2E)', () => {
  const appUrl = 'http://localhost:3000';
  const clientEmail = 'e2e.appointment.client@example.com';
  const petshopEmail = 'e2e.appointment.petshop@example.com';
  const password = 'password123';

  let clientToken: string;
  let petshopToken: string;
  let petShopId: string;
  let petId: string;
  let serviceId: string;

  beforeAll(async () => {
    await prisma.$connect();
    // Limpeza
    await prisma.clientUser.deleteMany({ where: { email: clientEmail } });
    await prisma.petShop.deleteMany({ where: { name: 'E2E Appointment PetShop' } });

    // Criar PetShop, Serviço, Cliente e Pet
    const petshop = await prisma.petShop.create({
      data: {
        name: 'E2E Appointment PetShop',
        workingHours: { '6': [{ start: '09:00', end: '18:00' }] },
      },
    });
    petShopId = petshop.id;

    const service = await prisma.service.create({
      data: { name: 'Banho E2E', duration: 60, price: 50, petShopId },
    });
    serviceId = service.id;

    const passwordHash = await hash(password, 8);
    const client = await prisma.clientUser.create({
      data: { name: 'E2E Client', email: clientEmail, password: passwordHash },
    });
    const pet = await prisma.pet.create({
      data: { name: 'Bolinha', ownerId: client.id, size: 'PEQUENO' },
    });
    petId = pet.id;

    await prisma.petShopUser.create({
      data: {
        name: 'E2E PetShop Owner',
        email: petshopEmail,
        password: passwordHash,
        role: 'OWNER',
        petShopId,
      },
    });

    // Autenticar
    const clientAuthRes = await request(appUrl)
      .post('/api/auth/client/login')
      .send({ email: clientEmail, password });
    clientToken = clientAuthRes.body.accessToken;

    const petshopAuthRes = await request(appUrl)
      .post('/api/auth/petshop/login')
      .send({ email: petshopEmail, password });
    petshopToken = petshopAuthRes.body.accessToken;
  });

  afterAll(async () => {
    await prisma.petShop.deleteMany({ where: { name: 'E2E Appointment PetShop' } });
    await prisma.clientUser.deleteMany({ where: { email: clientEmail } });
    await prisma.$disconnect();
  });

  it('should be able to create an appointment', async () => {
    const date = new Date('2025-07-12T14:00:00.000Z'); // Um sábado

    const response = await request(appUrl)
      .post('/api/client/me/appointments')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        petShopId,
        petId,
        serviceIds: [serviceId],
        startTime: date.toISOString(),
      });

    expect(response.status).toBe(201);
    expect(response.body.appointment).toHaveProperty('id');
  });

  it('should not be able to create an appointment with a schedule conflict', async () => {
    const date = new Date('2025-07-12T14:30:00.000Z'); // Meia hora depois, conflitando

    const response = await request(appUrl)
      .post('/api/client/me/appointments')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        petShopId,
        petId,
        serviceIds: [serviceId],
        startTime: date.toISOString(),
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toEqual('The requested time is already booked.');
  });

  it('should be able to list its own agenda', async () => {
    const date = '2025-07-12';
    const response = await request(appUrl)
      .get(`/api/petshops/me/agenda?date=${date}`)
      .set('Authorization', `Bearer ${petshopToken}`);

    expect(response.status).toBe(200);
    expect(response.body.appointments).toBeInstanceOf(Array);
    expect(response.body.appointments.length).toBe(1);
  });
});
