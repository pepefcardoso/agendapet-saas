import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createAndAuthenticatePetShopUser } from '@/utils/test/create-and-authenticate-user';
import { prisma } from '@/infra/database/prisma/client';
describe('Manage Client Subscription Plans (E2E)', () => {
  let petShopUserToken: string;
  let otherPetShopUserToken: string;
  let createdPlanId: string;

  beforeAll(async () => {
    const { token: token1 } = await createAndAuthenticatePetShopUser({
      name: 'PetShop Owner 1',
    });
    const { token: token2 } = await createAndAuthenticatePetShopUser({
      name: 'PetShop Owner 2',
    });

    petShopUserToken = token1;
    otherPetShopUserToken = token2;
  });

  afterAll(async () => {
    await prisma.clientSubscriptionPlan.deleteMany();
    await prisma.petShopUser.deleteMany();
    await prisma.petShop.deleteMany();
  });

  it('should be able to create a new client subscription plan', async () => {
    const response = await request(app.server)
      .post('/api/petshops/me/client-plans')
      .set('Authorization', `Bearer ${petShopUserToken}`)
      .send({
        name: 'Plano Basic',
        price: 49.9,
        credits: { "baths": 4, "grooming": 1 },
      });

    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty('id');
    createdPlanId = response.body.id;
  });

  it('should be able to list own client subscription plans', async () => {
    await request(app.server)
      .post('/api/petshops/me/client-plans')
      .set('Authorization', `Bearer ${otherPetShopUserToken}`)
      .send({ name: 'Plano do Concorrente', price: 99, credits: {} });

    const response = await request(app.server)
      .get('/api/petshops/me/client-plans')
      .set('Authorization', `Bearer ${petShopUserToken}`);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toEqual('Plano Basic');
  });

  it('should not be able to update a plan from another petshop', async () => {
    const response = await request(app.server)
      .put(`/api/petshops/me/client-plans/${createdPlanId}`)
      .set('Authorization', `Bearer ${otherPetShopUserToken}`) // Tenta usar o token do outro usuário
      .send({
        name: 'Plano Basic Editado Maliciosamente',
      });

    // Espera-se 404 pois a lógica de permissão (dentro do UpdateUseCase) não encontrará o recurso para esse usuário
    expect(response.statusCode).toEqual(404);
  });

  it('should be able to update an own plan', async () => {
    const response = await request(app.server)
      .put(`/api/petshops/me/client-plans/${createdPlanId}`)
      .set('Authorization', `Bearer ${petShopUserToken}`)
      .send({
        price: 59.9,
      });

    expect(response.statusCode).toEqual(200);
    expect(response.body.price).toBe(59.9);
  });

  it('should be able to deactivate an own plan', async () => {
    const response = await request(app.server)
      .delete(`/api/petshops/me/client-plans/${createdPlanId}`)
      .set('Authorization', `Bearer ${petShopUserToken}`);

    expect(response.statusCode).toEqual(204);

    // Verifica se o plano foi desativado (não deve aparecer na listagem padrão)
    const listResponse = await request(app.server)
      .get('/api/petshops/me/client-plans')
      .set('Authorization', `Bearer ${petShopUserToken}`);

    expect(listResponse.statusCode).toEqual(200);
    expect(listResponse.body).toHaveLength(0);
  });
});
