import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Decimal } from '@prisma/client/runtime/library';
import {
  createClientSubscriptionPlanSchema,
  updateClientSubscriptionPlanSchema,
} from '@/infra/http/dtos/ClientSubscriptionPlanDTO';
import { CreateClientSubscriptionPlanUseCase } from '@/core/application/use-cases/CreateClientSubscriptionPlanUseCase';
import { ListClientSubscriptionPlansUseCase } from '@/core/application/use-cases/ListClientSubscriptionPlansUseCase';
import { UpdateClientSubscriptionPlanUseCase } from '@/core/application/use-cases/UpdateClientSubscriptionPlanUseCase';
import { DeactivateClientSubscriptionPlanUseCase } from '@/core/application/use-cases/DeactivateClientSubscriptionPlanUseCase';
import { ResourceNotFoundError } from '@/core/application/use-cases/errors/ResourceNotFoundError';

export class ClientPlanController {
  constructor(
    private createClientSubscriptionPlanUseCase: CreateClientSubscriptionPlanUseCase,
    private listClientSubscriptionPlansUseCase: ListClientSubscriptionPlansUseCase,
    private updateClientSubscriptionPlanUseCase: UpdateClientSubscriptionPlanUseCase,
    private deactivateClientSubscriptionPlanUseCase: DeactivateClientSubscriptionPlanUseCase,
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

  async create(request: NextRequest) {
    try {
      const petShopId = this.getPetShopId(request);
      if (!petShopId) return this.handleAuthError();

      const body = await request.json();
      const data = createClientSubscriptionPlanSchema.parse(body);

      const plan = await this.createClientSubscriptionPlanUseCase.execute({
        ...data,
        petShopId,
      });

      return NextResponse.json({ plan }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { message: 'Dados inválidos.', errors: error.flatten().fieldErrors },
          { status: 400 },
        );
      }
      console.error(error);
      return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
    }
  }

  async list(request: NextRequest) {
    try {
      const petShopId = this.getPetShopId(request);
      if (!petShopId) return this.handleAuthError();

      const plans = await this.listClientSubscriptionPlansUseCase.execute({ petShopId });
      return NextResponse.json({ plans }, { status: 200 });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
    }
  }

  async update(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const petShopId = this.getPetShopId(request);
      if (!petShopId) return this.handleAuthError();

      const body = await request.json();
      const data = updateClientSubscriptionPlanSchema.parse(body);

      const updateData: { name?: string; price?: Decimal; credits?: any } = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.price !== undefined) updateData.price = new Decimal(data.price);
      if (data.credits !== undefined) updateData.credits = data.credits;

      const plan = await this.updateClientSubscriptionPlanUseCase.execute({
        planId: params.id,
        petShopId,
        data: updateData,
      });

      return NextResponse.json({ plan }, { status: 200 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { message: 'Dados inválidos.', errors: error.flatten().fieldErrors },
          { status: 400 },
        );
      }
      if (error instanceof ResourceNotFoundError) {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
      console.error(error);
      return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
    }
  }

  async delete(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const petShopId = this.getPetShopId(request);
      if (!petShopId) return this.handleAuthError();

      await this.deactivateClientSubscriptionPlanUseCase.execute({
        planId: params.id,
        petShopId,
      });

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
      console.error(error);
      return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
    }
  }
}
