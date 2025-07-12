import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaPetRepository } from '@/infra/database/prisma/repositories/PrismaPetRepository';
import { CreatePetUseCase } from '@/core/application/use-cases/CreatePetUseCase';
import { ListMyPetsUseCase } from '@/core/application/use-cases/ListMyPetsUseCase';
import { UpdatePetUseCase } from '@/core/application/use-cases/UpdatePetUseCase';
import { DeletePetUseCase } from '@/core/application/use-cases/DeletePetUseCase';
import { createPetBodySchema, updatePetBodySchema } from '../dtos/PetDTO';
import { ResourceNotFoundError } from '@/core/application/use-cases/errors/ResourceNotFoundError';
import { NotAuthorizedError } from '@/core/application/use-cases/errors/NotAuthorizedError';

export class PetController {
  private petRepository = new PrismaPetRepository();

  async create(request: NextRequest): Promise<NextResponse> {
    try {
      const ownerId = request.headers.get('X-User-ID');
      if (!ownerId) {
        return NextResponse.json({ message: 'Client ID is missing.' }, { status: 400 });
      }

      const requestBody = await request.json();
      const { name, size } = createPetBodySchema.parse(requestBody);

      const createPetUseCase = new CreatePetUseCase(this.petRepository);
      const { pet } = await createPetUseCase.execute({ name, size, ownerId });

      return NextResponse.json({ pet }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { message: 'Validation error.', issues: error.format() },
          { status: 400 },
        );
      }
      console.error(error);
      return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
    }
  }

  async list(request: NextRequest): Promise<NextResponse> {
    try {
      const ownerId = request.headers.get('X-User-ID');
      if (!ownerId) {
        return NextResponse.json({ message: 'Client ID is missing.' }, { status: 400 });
      }

      const listMyPetsUseCase = new ListMyPetsUseCase(this.petRepository);
      const { pets } = await listMyPetsUseCase.execute({ ownerId });

      return NextResponse.json({ pets });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
    }
  }

  async update(
    request: NextRequest,
    { params }: { params: { id: string } },
  ): Promise<NextResponse> {
    try {
      const ownerId = request.headers.get('X-User-ID');
      if (!ownerId) {
        return NextResponse.json({ message: 'Client ID is missing.' }, { status: 400 });
      }

      const petId = params.id;
      const requestBody = await request.json();
      const data = updatePetBodySchema.parse(requestBody);

      const updatePetUseCase = new UpdatePetUseCase(this.petRepository);
      const { pet } = await updatePetUseCase.execute({ petId, ownerId, data });

      return NextResponse.json({ pet });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { message: 'Validation error.', issues: error.format() },
          { status: 400 },
        );
      }
      if (error instanceof ResourceNotFoundError) {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
      if (error instanceof NotAuthorizedError) {
        return NextResponse.json({ message: error.message }, { status: 403 });
      }
      console.error(error);
      return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
    }
  }

  async delete(
    request: NextRequest,
    { params }: { params: { id: string } },
  ): Promise<NextResponse> {
    try {
      const ownerId = request.headers.get('X-User-ID');
      if (!ownerId) {
        return NextResponse.json({ message: 'Client ID is missing.' }, { status: 400 });
      }

      const petId = params.id;

      const deletePetUseCase = new DeletePetUseCase(this.petRepository);
      await deletePetUseCase.execute({ petId, ownerId });

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
      if (error instanceof NotAuthorizedError) {
        return NextResponse.json({ message: error.message }, { status: 403 });
      }
      console.error(error);
      return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
    }
  }
}
