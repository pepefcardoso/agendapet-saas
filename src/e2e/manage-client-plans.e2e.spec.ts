import { prisma } from '@/infra/database/prisma/client';
import { createAndAuthenticatePetshop } from '@/utils/test/CreateAndAuthenticatePetshop';
import request from 'supertest';
import { describe, it, expect } from 'vitest';

// A URL base da sua API em ambiente de teste
const API_URL = 'http://localhost:3000'; // Ou a porta que você usa para 'next dev'

describe('Manage Client Subscription Plans (E2E)', () => {
  it('should be able to create a client subscription plan', async () => {
    // 1. Preparar o ambiente
    const { token } = await createAndAuthenticatePetshop();
    const service = await prisma.service.create({
      data: {
        name: 'Banho Teste',
        price: 30,
        duration: 45,
        petShopId: (await createAndAuthenticatePetshop()).petShop.id, // Cria um service em um petshop
      },
    });

    // 2. Executar a ação
    const response = await request(API_URL)
      .post('/api/petshops/me/client-plans')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Plano Básico E2E',
        price: 49.9,
        credits: [{ serviceId: service.id, quantity: 2 }],
      });

    // 3. Verificar o resultado
    expect(response.statusCode).toEqual(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        name: 'Plano Básico E2E',
      }),
    );
  });

  it('should be able to list its own client subscription plans', async () => {
    const { token, petShop } = await createAndAuthenticatePetshop({ name: 'My PetShop' });
    await createAndAuthenticatePetshop({ name: 'Another PetShop' }); // Petshop de outra pessoa

    // Criar planos apenas para "My PetShop"
    await prisma.clientSubscriptionPlan.create({
      data: { name: 'Plano A', price: 10, credits: [], petShopId: petShop.id },
    });
    await prisma.clientSubscriptionPlan.create({
      data: { name: 'Plano B', price: 20, credits: [], petShopId: petShop.id },
    });

    const response = await request(API_URL)
      .get('/api/petshops/me/client-plans')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveLength(2); // Deve retornar apenas os 2 planos do petshop autenticado
    expect(response.body[0].name).toContain('Plano');
  });

  it('should not be able to update a plan from another petshop', async () => {
    const { petShop: ownerPetShop } = await createAndAuthenticatePetshop({ name: 'Owner PetShop' });
    const { token: intruderToken } = await createAndAuthenticatePetshop({
      name: 'Intruder PetShop',
    });

    // Plano criado pelo dono
    const plan = await prisma.clientSubscriptionPlan.create({
      data: { name: 'Plano Secreto', price: 99, credits: [], petShopId: ownerPetShop.id },
    });

    const response = await request(API_URL)
      .put(`/api/petshops/me/client-plans/${plan.id}`)
      .set('Authorization', `Bearer ${intruderToken}`) // Usando o token do intruso
      .send({ name: 'Plano Hackeado' });

    expect(response.statusCode).toEqual(404); // A regra de negócio retorna 'não encontrado' por segurança
  });
});
