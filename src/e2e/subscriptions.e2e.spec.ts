import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/app'; // Assumindo que seu entrypoint da API/app é exportado
import { prisma } from '@/infra/database/prisma/client';
import { JwtService } from '@/infra/providers/JwtService'; // Usaremos para gerar tokens de teste
import { hash } from 'bcryptjs';
import { PetSize } from '@prisma/client';

describe('Client Subscription and Credit Flow (E2E)', () => {
  // Setup do servidor de teste
  beforeAll(async () => {
    await app.ready(); // Em frameworks como Fastify, esperamos o app ficar pronto
  });

  afterAll(async () => {
    await app.close(); // Fechar o servidor
  });

  // --- Variáveis de escopo para armazenar dados de teste ---
  let petShopId: string;
  let clientToken: string;
  let clientId: string;
  let serviceWithCreditId: string;
  let serviceWithoutCreditId: string;
  let subscriptionPlanId: string;
  let clientSubscriptionId: string;

  // --- Bloco de setup do banco de dados ---
  beforeAll(async () => {
    // Limpar o banco para garantir um teste isolado (opcional, mas recomendado)
    await prisma.appointment.deleteMany();
    await prisma.clientSubscriptionCredit.deleteMany();
    await prisma.clientSubscription.deleteMany();
    await prisma.clientSubscriptionPlan.deleteMany();
    await prisma.service.deleteMany();
    await prisma.pet.deleteMany();
    await prisma.petShopClient.deleteMany();
    await prisma.clientUser.deleteMany();
    await prisma.petShopUser.deleteMany();
    await prisma.petShop.deleteMany();

    // 1. Criar um PetShop e seu Dono
    const petShop = await prisma.petShop.create({
      data: {
        name: 'E2E Pet Shop',
      },
    });
    petShopId = petShop.id;

    // 2. Criar um Cliente e seu Pet
    const client = await prisma.clientUser.create({
      data: {
        name: 'E2E Client User',
        email: 'e2e-client@test.com',
        password: await hash('123456', 6),
      },
    });
    clientId = client.id;

    await prisma.pet.create({
      data: {
        name: 'Bolinha',
        ownerId: client.id,
        size: PetSize.PEQUENO,
      },
    });

    // 3. Criar Serviços oferecidos pelo PetShop
    const serviceWithCredit = await prisma.service.create({
      data: {
        name: 'Banho & Tosa E2E',
        duration: 60,
        price: 50.0,
        petShopId: petShop.id,
      },
    });
    serviceWithCreditId = serviceWithCredit.id;

    const serviceWithoutCredit = await prisma.service.create({
      data: {
        name: 'Corte de Unha E2E',
        duration: 15,
        price: 20.0,
        petShopId: petShop.id,
      },
    });
    serviceWithoutCreditId = serviceWithoutCredit.id;

    // 4. Criar o Plano de Assinatura do PetShop
    const plan = await prisma.clientSubscriptionPlan.create({
      data: {
        name: 'Plano Banhos E2E',
        price: 150.0,
        petShopId: petShop.id,
        credits: [
          // Este JSON deve corresponder à estrutura do seu schema
          { serviceId: serviceWithCreditId, quantity: 4 },
        ],
        isActive: true,
      },
    });
    subscriptionPlanId = plan.id;

    // 5. Gerar o Token JWT para o Cliente
    const jwtService = new JwtService();
    clientToken = jwtService.sign({ sub: client.id });
  });

  // --- Cenários de Teste ---

  it('should be able to subscribe to a plan', async () => {
    const response = await request(app.server)
      .post('/api/client/me/subscriptions')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        planId: subscriptionPlanId,
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toEqual(expect.any(String));
    clientSubscriptionId = response.body.id; // Salvar para o próximo teste

    // Verificar o banco de dados
    const createdSubscription = await prisma.clientSubscription.findFirst({
      where: {
        clientId: clientId,
        planId: subscriptionPlanId,
      },
    });
    expect(createdSubscription).not.toBeNull();
    expect(createdSubscription?.status).toBe('ACTIVE');

    const createdCredits = await prisma.clientSubscriptionCredit.findFirst({
      where: {
        subscriptionId: createdSubscription?.id,
        serviceId: serviceWithCreditId,
      },
    });
    expect(createdCredits).not.toBeNull();
    expect(createdCredits?.remainingCredits).toBe(4);
  });

  it('should be able to create an appointment using subscription credits', async () => {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 1, 0, 0, 0); // Agendar para a próxima hora cheia

    const response = await request(app.server)
      .post('/api/client/me/appointments') // Assumindo que a rota de criação de agendamento exista
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        petShopId,
        petId: (await prisma.pet.findFirst({ where: { ownerId: clientId } }))!.id,
        serviceIds: [serviceWithCreditId],
        startTime: startTime.toISOString(),
        paymentType: 'SUBSCRIPTION_CREDIT',
      });

    expect(response.status).toBe(201); // Ou 200, dependendo da sua implementação
    expect(response.body.appointment.status).toBe('CONFIRMED');

    // Verificar se o crédito foi debitado
    const creditAfter = await prisma.clientSubscriptionCredit.findFirst({
      where: {
        subscriptionId: clientSubscriptionId,
        serviceId: serviceWithCreditId,
      },
    });
    expect(creditAfter?.remainingCredits).toBe(3);
  });

  it('should return an error when trying to use insufficient credits', async () => {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 2, 0, 0, 0); // Agendar para 2h no futuro

    const response = await request(app.server)
      .post('/api/client/me/appointments')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        petShopId,
        petId: (await prisma.pet.findFirst({ where: { ownerId: clientId } }))!.id,
        serviceIds: [serviceWithoutCreditId], // Usando o serviço para o qual não há crédito
        startTime: startTime.toISOString(),
        paymentType: 'SUBSCRIPTION_CREDIT',
      });

    // O UseCase lança InsufficientCreditsError, que o controller deve mapear para um erro do cliente
    expect(response.status).toBe(400); // Bad Request é um bom status para falha de regra de negócio
    expect(response.body.message).toContain('Insufficient credits');
  });

  it('should be able to cancel a subscription', async () => {
    const response = await request(app.server)
      .delete(`/api/client/me/subscriptions/${clientSubscriptionId}`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(response.status).toBe(204);

    // Verificar o banco de dados
    const canceledSubscription = await prisma.clientSubscription.findUnique({
      where: { id: clientSubscriptionId },
    });
    expect(canceledSubscription?.status).toBe('CANCELLED');
  });
});
