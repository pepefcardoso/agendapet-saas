import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CreateServiceUseCase } from '@/core/application/use-cases/CreateServiceUseCase';
import { ListServicesByPetShopUseCase } from '@/core/application/use-cases/ListServicesByPetShopUseCase';
import { UpdateServiceUseCase } from '@/core/application/use-cases/UpdateServiceUseCase';
import { DeleteServiceUseCase } from '@/core/application/use-cases/DeleteServiceUseCase';
import { createServiceBodySchema, updateServiceBodySchema } from '../dtos/ServiceDTO';
import { ServiceNotFoundError } from '@/core/application/use-cases/errors/ServiceNotFoundError';
import { NotAuthorizedError } from '@/core/application/use-cases/errors/NotAuthorizedError';

export class ServiceController {
  constructor(
    private createServiceUseCase: CreateServiceUseCase,
    private listServicesByPetShopUseCase: ListServicesByPetShopUseCase,
    private updateServiceUseCase: UpdateServiceUseCase,
    private deleteServiceUseCase: DeleteServiceUseCase,
  ) {}

  private getPetShopId(request: NextRequest): string | null {
    return request.headers.get('X-PetShop-ID');
  }

  private handleAuthError() {
    console.error(
      'CRITICAL: PetShop ID not found in request headers. Check middleware configuration.',
    );
    return NextResponse.json(
      { message: 'Internal Server Error: Missing authentication context.' },
      { status: 500 },
    );
  }

  async create(request: NextRequest): Promise<NextResponse> {
    try {
      const petShopId = this.getPetShopId(request);
      if (!petShopId) return this.handleAuthError();

      const requestBody = await request.json();
      const { name, duration, price } = createServiceBodySchema.parse(requestBody);

      const { service } = await this.createServiceUseCase.execute({
        name,
        duration,
        price,
        petShopId,
      });

      return NextResponse.json({ service }, { status: 201 });
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
      const petShopId = this.getPetShopId(request);
      if (!petShopId) return this.handleAuthError();

      const { services } = await this.listServicesByPetShopUseCase.execute({ petShopId });

      return NextResponse.json({ services });
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
      const petShopId = this.getPetShopId(request);
      if (!petShopId) return this.handleAuthError();

      const serviceId = params.id;
      const requestBody = await request.json();
      const data = updateServiceBodySchema.parse(requestBody);

      const { service } = await this.updateServiceUseCase.execute({
        serviceId,
        petShopId,
        data,
      });

      return NextResponse.json({ service });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { message: 'Validation error.', issues: z.treeifyError(error) },
          { status: 400 },
        );
      }
      if (error instanceof ServiceNotFoundError) {
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
      const petShopId = this.getPetShopId(request);
      if (!petShopId) return this.handleAuthError();

      const serviceId = params.id;

      await this.deleteServiceUseCase.execute({ serviceId, petShopId });

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      if (error instanceof ServiceNotFoundError) {
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
