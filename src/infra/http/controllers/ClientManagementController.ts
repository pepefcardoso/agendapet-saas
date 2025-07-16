import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AddClientToPetShopUseCase } from '@/core/application/use-cases/AddClientToPetShopUseCase';
import { ListPetShopClientsUseCase } from '@/core/application/use-cases/ListPetShopClientsUseCase';
import { addClientBodySchema } from '../dtos/AddClientDTO';
import { ClientAlreadyLinkedError } from '@/core/application/use-cases/errors/ClientAlreadyLinkedError';

export class ClientManagementController {
  constructor(
    private addClientToPetShopUseCase: AddClientToPetShopUseCase,
    private listPetShopClientsUseCase: ListPetShopClientsUseCase,
  ) {}

  async add(request: NextRequest): Promise<NextResponse> {
    try {
      const petShopId = request.headers.get('X-PetShop-ID');

      if (!petShopId) {
        console.error(
          'CRITICAL: PetShop ID not found in request headers. Check middleware configuration.',
        );
        return NextResponse.json(
          { message: 'Internal Server Error: Missing authentication context.' },
          { status: 500 },
        );
      }

      const requestBody = await request.json();
      const { name, email } = addClientBodySchema.parse(requestBody);

      await this.addClientToPetShopUseCase.execute({
        name,
        email,
        petShopId,
      });

      return new NextResponse(null, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { message: 'Validation error.', issues: z.treeifyError(error) },
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
        console.error(
          'CRITICAL: PetShop ID not found in request headers. Check middleware configuration.',
        );
        return NextResponse.json(
          { message: 'Internal Server Error: Missing authentication context.' },
          { status: 500 },
        );
      }

      const { clients } = await this.listPetShopClientsUseCase.execute({ petShopId });

      return NextResponse.json({ clients });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
    }
  }
}
