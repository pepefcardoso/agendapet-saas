import { app } from '@/app';
import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createAndAuthenticatePetShopUser } from '@/utils/test/create-and-authenticate-user';
import { prisma } from '@/infra/database/prisma/client';

describe('Loyalty Endpoints (e2e)', () => {
  beforeAll(async () => {
    // Prepara o ambiente de teste
    await app.ready();
  });

  afterAll(async () => {
    // Limpa o ambiente de teste
    await app.close();
  });

  it('deve ser capaz de criar ou atualizar um plano de fidelidade (PUT /api/petshops/me/loyalty-plan)', async () => {
    const { token, petShopId } = await createAndAuthenticatePetShopUser(app);

    // Cria o plano
    let response = await request(app.server)
      .put('/api/petshops/me/loyalty-plan')
      .set('Authorization', `Bearer ${token}`)
      .send({ pointsPerReal: 1 });

    expect(response.statusCode).toBe(200);
    expect(response.body.loyaltyPlan.petShopId).toBe(petShopId);
    expect(response.body.loyaltyPlan.pointsPerReal).toBe(1);

    // Atualiza o plano
    response = await request(app.server)
      .put('/api/petshops/me/loyalty-plan')
      .set('Authorization', `Bearer ${token}`)
      .send({ pointsPerReal: 2 });

    expect(response.statusCode).toBe(200);
    expect(response.body.loyaltyPlan.pointsPerReal).toBe(2);
  });

  it('deve ser capaz de gerenciar promoções de fidelidade (CRUD)', async () => {
    const { token, petShopId } = await createAndAuthenticatePetShopUser(app);
    // Cria um serviço para associar à promoção
    const service = await prisma.service.create({
      data: {
        name: 'Banho Teste',
        duration: 60,
        price: 50,
        petShopId,
      },
    });

    // 1. Primeiro, cria o plano de fidelidade
    await request(app.server)
      .put('/api/petshops/me/loyalty-plan')
      .set('Authorization', `Bearer ${token}`)
      .send({ pointsPerReal: 1 });

    // 2. Tenta criar promoção sem plano (não deve acontecer aqui, mas é um bom teste)
    // ...

    // 3. Cria a promoção (POST)
    const createResponse = await request(app.server)
      .post('/api/petshops/me/loyalty-promotions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Banho Grátis via E2E',
        pointsNeeded: 150,
        serviceCredits: [{ serviceId: service.id, quantity: 1 }],
      });

    expect(createResponse.statusCode).toBe(201);
    const promotionId = createResponse.body.promotion.id;
    expect(promotionId).toEqual(expect.any(String));

    // 4. Lista as promoções (GET)
    const listResponse = await request(app.server)
      .get('/api/petshops/me/loyalty-promotions')
      .set('Authorization', `Bearer ${token}`);

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body.promotions).toHaveLength(1);
    expect(listResponse.body.promotions[0].description).toBe('Banho Grátis via E2E');

    // 5. Atualiza a promoção (PUT)
    const updateResponse = await request(app.server)
      .put(`/api/petshops/me/loyalty-promotions/${promotionId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ pointsNeeded: 200 });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body.promotion.pointsNeeded).toBe(200);

    // 6. Deleta a promoção (DELETE)
    const deleteResponse = await request(app.server)
      .delete(`/api/petshops/me/loyalty-promotions/${promotionId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteResponse.statusCode).toBe(204);

    // 7. Verifica se a promoção foi realmente deletada
    const finalListResponse = await request(app.server)
      .get('/api/petshops/me/loyalty-promotions')
      .set('Authorization', `Bearer ${token}`);

    expect(finalListResponse.body.promotions).toHaveLength(0);
  });
});
