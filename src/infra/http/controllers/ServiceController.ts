import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaServiceRepository } from '@/infra/database/prisma/repositories/PrismaServiceRepository';
import { CreateServiceUseCase } from '@/core/application/use-cases/CreateServiceUseCase';
import { ListServicesByPetShopUseCase } from '@/core/application/use-cases/ListServicesByPetShopUseCase';
import { UpdateServiceUseCase } from '@/core/application/use-cases/UpdateServiceUseCase';
import { DeleteServiceUseCase } from '@/core/application/use-cases/DeleteServiceUseCase';
import { createServiceBodySchema, updateServiceBodySchema } from '../dtos/ServiceDTO';
import { ServiceNotFoundError } from '@/core/application/use-cases/errors/ServiceNotFoundError';
import { NotAuthorizedError } from '@/core/application/use-cases/errors/NotAuthorizedError';

export class ServiceController {
  private serviceRepository = new PrismaServiceRepository();

  async create(request: NextRequest): Promise<NextResponse> {
    try {
      const petShopId = request.headers.get('X-PetShop-ID');
      if (!petShopId) {
        return NextResponse.json({ message: 'PetShop ID is missing.' }, { status: 400 });
      }

      const requestBody = await request.json();
      const { name, duration, price } = createServiceBodySchema.parse(requestBody);

      const createServiceUseCase = new CreateServiceUseCase(this.serviceRepository);
      const { service } = await createServiceUseCase.execute({
        name,
        duration,
        price,
        petShopId,
      });

      return NextResponse.json({ service }, { status: 201 });
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
      const petShopId = request.headers.get('X-PetShop-ID');
      if (!petShopId) {
        return NextResponse.json({ message: 'PetShop ID is missing.' }, { status: 400 });
      }

      const listServicesUseCase = new ListServicesByPetShopUseCase(this.serviceRepository);
      const { services } = await listServicesUseCase.execute({ petShopId });

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
      const petShopId = request.headers.get('X-PetShop-ID');
      if (!petShopId) {
        return NextResponse.json({ message: 'PetShop ID is missing.' }, { status: 400 });
      }

      const serviceId = params.id;
      const requestBody = await request.json();
      const data = updateServiceBodySchema.parse(requestBody);

      const updateServiceUseCase = new UpdateServiceUseCase(this.serviceRepository);
      const { service } = await updateServiceUseCase.execute({
        serviceId,
        petShopId,
        data,
      });

      return NextResponse.json({ service });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { message: 'Validation error.', issues: error.format() },
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
      const petShopId = request.headers.get('X-PetShop-ID');
      if (!petShopId) {
        return NextResponse.json({ message: 'PetShop ID is missing.' }, { status: 400 });
      }

      const serviceId = params.id;

      const deleteServiceUseCase = new DeleteServiceUseCase(this.serviceRepository);
      await deleteServiceUseCase.execute({ serviceId, petShopId });

      return new NextResponse(null, { status: 204 }); // No Content
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
