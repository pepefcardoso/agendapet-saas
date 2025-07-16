import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/app'; // Assumindo que 'app' é a instância do servidor Next.js para testes e2e
import { prisma } from '@/infra/database/prisma/client';
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user';
import { makePetShop } from '@/utils/test/make-pet-shop';
import { makeClientUser } from '@/utils/test/make-client-user';
import { makeAppointment } from '@/utils/test/make-appointment';
import { AppointmentStatus, Role } from '@prisma/client';

describe('Ratings E2E', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be able to create a rating (E2E)', async () => {
    // 1. Criar e autenticar um usuário PetShop
    const { petShop, petShopUser, token: petShopUserToken } = await createAndAuthenticateUser();

    // 2. Criar um cliente para o PetShop
    const clientUser = makeClientUser();
    await prisma.clientUser.create({ data: clientUser });

    // 3. Autenticar o cliente
    const clientToken = (
      await request(app.server)
        .post('/api/auth/client/login')
        .send({
          email: clientUser.email,
          password: clientUser.password.replace('hashed-', ''), // Usar a senha não hashada para login
        })
    ).body.token;

    // 4. Criar um agendamento COMPLETED para o cliente no PetShop
    await prisma.appointment.create({
      data: makeAppointment({
        clientId: clientUser.id,
        petShopId: petShop.id,
        status: AppointmentStatus.COMPLETED,
      }),
    });

    const response = await request(app.server)
      .post(`/api/petshops/${petShop.id}/ratings`)
      .set('Authorization', `Bearer ${clientToken}`) // Cliente autenticado
      .send({
        score: 4,
        comment: 'Very good experience, pet was happy!',
      });

    expect(response.statusCode).toEqual(201);
    expect(response.body.rating).toEqual(
      expect.objectContaining({
        score: 4,
        comment: 'Very good experience, pet was happy!',
        clientId: clientUser.id,
        petShopId: petShop.id,
      }),
    );
  });

  it('should not be able to create a rating if client has no completed appointments', async () => {
    // 1. Criar e autenticar um usuário PetShop
    const { petShop, petShopUser, token: petShopUserToken } = await createAndAuthenticateUser();

    // 2. Criar um cliente para o PetShop
    const clientUser = makeClientUser();
    await prisma.clientUser.create({ data: clientUser });

    // 3. Autenticar o cliente
    const clientToken = (
      await request(app.server)
        .post('/api/auth/client/login')
        .send({
          email: clientUser.email,
          password: clientUser.password.replace('hashed-', ''),
        })
    ).body.token;

    // Não criar agendamentos ou criar agendamentos PENDING
    await prisma.appointment.create({
      data: makeAppointment({
        clientId: clientUser.id,
        petShopId: petShop.id,
        status: AppointmentStatus.PENDING,
      }),
    });

    const response = await request(app.server)
      .post(`/api/petshops/${petShop.id}/ratings`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        score: 3,
        comment: 'I never completed an appointment here.',
      });

    expect(response.statusCode).toEqual(403); // Not Allowed Error
    expect(response.body.message).toEqual(
      'Você só pode avaliar petshops com os quais já teve agendamentos concluídos.',
    );
  });

  it('should be able to list ratings by petShop (E2E)', async () => {
    // 1. Criar um PetShop
    const petShop = makePetShop();
    await prisma.petShop.create({ data: petShop });

    // 2. Criar dois clientes e avaliações para o PetShop
    const client1 = makeClientUser();
    const client2 = makeClientUser();
    await prisma.clientUser.createMany({ data: [client1, client2] });

    await prisma.rating.create({
      data: {
        score: 5,
        comment: 'Excellent service!',
        clientId: client1.id,
        petShopId: petShop.id,
      },
    });

    await prisma.rating.create({
      data: {
        score: 4,
        comment: 'Good attention!',
        clientId: client2.id,
        petShopId: petShop.id,
      },
    });

    // 3. Criar uma avaliação para OUTRO petshop (não deve aparecer na listagem)
    const otherPetShop = makePetShop({ name: 'Other PetShop' });
    await prisma.petShop.create({ data: otherPetShop });
    const client3 = makeClientUser();
    await prisma.clientUser.create({ data: client3 });
    await prisma.rating.create({
      data: {
        score: 3,
        comment: 'Just OK.',
        clientId: client3.id,
        petShopId: otherPetShop.id,
      },
    });

    const response = await request(app.server).get(`/api/petshops/${petShop.id}/ratings`).send(); // Rota pública, não precisa de autenticação

    expect(response.statusCode).toEqual(200);
    expect(response.body.ratings).toHaveLength(2);
    expect(response.body.totalCount).toEqual(2);
    expect(response.body.ratings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          score: 5,
          comment: 'Excellent service!',
          clientId: client1.id,
          petShopId: petShop.id,
          client: expect.objectContaining({ name: client1.name }), // Verificar o nome do cliente
        }),
        expect.objectContaining({
          score: 4,
          comment: 'Good attention!',
          clientId: client2.id,
          petShopId: petShop.id,
          client: expect.objectContaining({ name: client2.name }),
        }),
      ]),
    );
    expect(response.body.ratings[0].client.email).toBeUndefined(); // Certificar que email não é exposto
  });

  it('should be able to list ratings with pagination (E2E)', async () => {
    const petShop = makePetShop();
    await prisma.petShop.create({ data: petShop });

    // Criar 20 avaliações para o petshop
    for (let i = 1; i <= 20; i++) {
      const client = makeClientUser({ email: `client-${i}@example.com` });
      await prisma.clientUser.create({ data: client });
      await prisma.rating.create({
        data: {
          score: (i % 5) + 1,
          comment: `Rating ${i}`,
          clientId: client.id,
          petShopId: petShop.id,
        },
      });
    }

    const responsePage1 = await request(app.server)
      .get(`/api/petshops/${petShop.id}/ratings?page=1&limit=10`)
      .send();

    expect(responsePage1.statusCode).toEqual(200);
    expect(responsePage1.body.ratings).toHaveLength(10);
    expect(responsePage1.body.totalCount).toEqual(20);
    expect(responsePage1.body.page).toEqual(1);
    expect(responsePage1.body.limit).toEqual(10);
    expect(responsePage1.body.ratings[0].comment).toEqual('Rating 1'); // Exemplo de primeira avaliação

    const responsePage2 = await request(app.server)
      .get(`/api/petshops/${petShop.id}/ratings?page=2&limit=10`)
      .send();

    expect(responsePage2.statusCode).toEqual(200);
    expect(responsePage2.body.ratings).toHaveLength(10);
    expect(responsePage2.body.totalCount).toEqual(20);
    expect(responsePage2.body.page).toEqual(2);
    expect(responsePage2.body.limit).toEqual(10);
    expect(responsePage2.body.ratings[0].comment).toEqual('Rating 11'); // Exemplo de primeira avaliação da segunda página
  });
});
