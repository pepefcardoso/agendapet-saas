import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { prisma } from '@/infra/database/prisma/client';

describe('Register PetShop User (E2E)', () => {
  // O endereço da nossa aplicação a ser testada
  const appUrl = 'http://localhost:3000';
  let createdPetShopId: string;

  // 'beforeAll' é executado uma vez, antes de todos os testes deste arquivo
  beforeAll(async () => {
    // Para estes testes funcionarem, a aplicação precisa estar a rodar.
    // Iniciaremos com 'npm run dev' noutro terminal.
    await prisma.$connect(); // Conecta explicitamente ao banco

    // Limpa as tabelas para garantir um ambiente limpo
    await prisma.petShopUser.deleteMany();
    await prisma.petShop.deleteMany();

    // Como um PetShopUser precisa de um PetShop, vamos criar um como pré-requisito
    const petshop = await prisma.petShop.create({
      data: {
        name: 'PetShop E2E Test',
      },
    });
    createdPetShopId = petshop.id;
  });

  // 'afterAll' é executado uma vez, depois de todos os testes deste arquivo
  afterAll(async () => {
    // Limpa a base de dados depois dos testes para não deixar lixo
    await prisma.petShopUser.deleteMany();
    await prisma.petShop.deleteMany();
    await prisma.$disconnect(); // Desconecta do banco
  });

  it('should be able to register a new petshop user', async () => {
    const response = await request(appUrl) // Aponta para a nossa app a correr
      .post('/api/auth/petshop/register') // Faz um POST para o endpoint
      .send({
        // Envia os dados no corpo da requisição
        name: 'E2E Test User',
        email: 'e2e.user@example.com',
        password: 'password123',
        role: 'ADMIN',
        petShopId: createdPetShopId, // Usa o ID do petshop que criámos no beforeAll
      });

    // --- LINHA DE DEPURAÇÃO ADICIONADA ---
    // Se a resposta não for a esperada (201), imprime o corpo do erro no console
    if (response.status !== 201) {
      console.error('API Response Body on Failure (first test):', response.body);
    }
    // --- FIM DA LINHA DE DEPURAÇÃO ---

    // Esperamos que a resposta da API seja 201 (Created)
    expect(response.status).toBe(201);

    // Como verificação final, consultamos a base de dados diretamente
    // para garantir que o usuário foi realmente salvo.
    const userFromDb = await prisma.petShopUser.findUnique({
      where: { email: 'e2e.user@example.com' },
    });

    expect(userFromDb).not.toBeNull(); // O usuário não deve ser nulo
    expect(userFromDb?.name).toEqual('E2E Test User');
  });

  it('should not be able to register with an existing email', async () => {
    const response = await request(appUrl)
      .post('/api/auth/petshop/register')
      .send({
        name: 'Another E2E User',
        email: 'e2e.user@example.com', // Mesmo e-mail do teste anterior
        password: 'password123',
        role: 'ADMIN',
        petShopId: createdPetShopId,
      });

    // --- LINHA DE DEPURAÇÃO ADICIONADA ---
    if (response.status !== 409) {
      console.error('API Response Body on Failure (second test):', response.body);
    }
    // --- FIM DA LINHA DE DEPURAÇÃO ---

    // Esperamos que a API retorne 409 (Conflict), como definimos no nosso controller
    expect(response.status).toBe(409);
  });
});