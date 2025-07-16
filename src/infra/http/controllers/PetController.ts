import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CreatePetUseCase } from '@/core/application/use-cases/CreatePetUseCase';
import { ListMyPetsUseCase } from '@/core/application/use-cases/ListMyPetsUseCase';
import { UpdatePetUseCase } from '@/core/application/use-cases/UpdatePetUseCase';
import { DeletePetUseCase } from '@/core/application/use-cases/DeletePetUseCase';
import { createPetBodySchema, updatePetBodySchema } from '../dtos/PetDTO';
import { ResourceNotFoundError } from '@/core/application/use-cases/errors/ResourceNotFoundError';
import { NotAuthorizedError } from '@/core/application/use-cases/errors/NotAuthorizedError';

export class PetController {
  constructor(
    private createPetUseCase: CreatePetUseCase,
    private listMyPetsUseCase: ListMyPetsUseCase,
    private updatePetUseCase: UpdatePetUseCase,
    private deletePetUseCase: DeletePetUseCase,
  ) {}

  private getOwnerId(request: NextRequest): string | null {
    return request.headers.get('X-User-ID');
  }

  private handleAuthError() {
    console.error(
      'CRITICAL: Client ID (ownerId) not found in request headers. Check middleware configuration.',
    );
    return NextResponse.json(
      { message: 'Internal Server Error: Missing authentication context.' },
      { status: 500 },
    );
  }

  async create(request: NextRequest): Promise<NextResponse> {
    try {
      const ownerId = this.getOwnerId(request);
      if (!ownerId) return this.handleAuthError();

      const requestBody = await request.json();
      const { name, size } = createPetBodySchema.parse(requestBody);

      const { pet } = await this.createPetUseCase.execute({ name, size, ownerId });

      return NextResponse.json({ pet }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { message: 'Validation error.', issues: z.treeifyError(error) },
          { status: 400 },
        );
      }
      console.error(error);
      return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
    }
  }

  async list(request: NextRequest): Promise<NextResponse> {
    try {
      const ownerId = this.getOwnerId(request);
      if (!ownerId) return this.handleAuthError();

      const { pets } = await this.listMyPetsUseCase.execute({ ownerId });

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
      const ownerId = this.getOwnerId(request);
      if (!ownerId) return this.handleAuthError();

      const petId = params.id;
      const requestBody = await request.json();
      const data = updatePetBodySchema.parse(requestBody);

      const { pet } = await this.updatePetUseCase.execute({ petId, ownerId, data });

      return NextResponse.json({ pet });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { message: 'Validation error.', issues: z.treeifyError(error) },
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
      const ownerId = this.getOwnerId(request);
      if (!ownerId) return this.handleAuthError();

      const petId = params.id;

      await this.deletePetUseCase.execute({ petId, ownerId });

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
