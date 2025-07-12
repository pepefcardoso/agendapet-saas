import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { PrismaClientUserRepository } from '@/infra/database/prisma/repositories/PrismaClientUserRepository';
import { PrismaPetShopClientRepository } from '@/infra/database/prisma/repositories/PrismaPetShopClientRepository';
import { AddClientToPetShopUseCase } from '@/core/application/use-cases/AddClientToPetShopUseCase';
import { ListPetShopClientsUseCase } from '@/core/application/use-cases/ListPetShopClientsUseCase';
import { addClientBodySchema } from '../dtos/AddClientDTO';
import { ClientAlreadyLinkedError } from '@/core/application/use-cases/errors/ClientAlreadyLinkedError';

export class ClientManagementController {
  async add(request: NextRequest): Promise<NextResponse> {
    try {
      const petShopId = request.headers.get('X-PetShop-ID');
      if (!petShopId) {
        return NextResponse.json({ message: 'PetShop ID is missing.' }, { status: 400 });
      }

      const requestBody = await request.json();
      const { name, email } = addClientBodySchema.parse(requestBody);

      const clientUserRepository = new PrismaClientUserRepository();
      const petShopClientRepository = new PrismaPetShopClientRepository();
      const addClientUseCase = new AddClientToPetShopUseCase(
        clientUserRepository,
        petShopClientRepository,
      );

      await addClientUseCase.execute({
        name,
        email,
        petShopId,
      });

      return new NextResponse(null, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { message: 'Validation error.', issues: error.format() },
          { status: 400 },
        );
      }
      if (error instanceof ClientAlreadyLinkedError) {
        return NextResponse.json({ message: error.message }, { status: 409 });
      }

      console.error(error);
      return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
    }
  }

  async list(request: NextRequest): Promise<NextResponse> {
    try {
      const petShopId = request.headers.get('X-PetShop-ID');
      if (!petShopId) {
        return NextResponse.json({ message: 'PetShop ID is missing.' }, { status: 400 });
      }

      const petShopClientRepository = new PrismaPetShopClientRepository();
      const listClientsUseCase = new ListPetShopClientsUseCase(petShopClientRepository);

      const { clients } = await listClientsUseCase.execute({ petShopId });

      return NextResponse.json({ clients });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
    }
  }
}
