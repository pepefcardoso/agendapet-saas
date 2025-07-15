import { NextRequest, NextResponse } from 'next/server';
import { PrismaClientSubscriptionPlanRepository } from '@/infra/database/prisma/repositories/PrismaClientSubscriptionPlanRepository';
import { UpdateClientSubscriptionPlanUseCase } from '@/core/application/use-cases/UpdateClientSubscriptionPlanUseCase';
import { DeactivateClientSubscriptionPlanUseCase } from '@/core/application/use-cases/DeactivateClientSubscriptionPlanUseCase';
import { updateClientSubscriptionPlanSchema } from '@/infra/http/dtos/ClientSubscriptionPlanDTO';
import { ZodError } from 'zod';
import { ResourceNotFoundError } from '@/core/application/use-cases/errors/ResourceNotFoundError';

interface RouteParams {
  params: { id: string };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const petShopId = request.headers.get('X-PetShop-ID');

  if (!petShopId) {
    return NextResponse.json({ message: 'ID do PetShop não encontrado no token' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = updateClientSubscriptionPlanSchema.parse(body);

    const planRepository = new PrismaClientSubscriptionPlanRepository();
    const updatePlanUseCase = new UpdateClientSubscriptionPlanUseCase(planRepository);

    const updatedPlan = await updatePlanUseCase.execute({
      planId: params.id,
      petShopId,
      data,
    });

    return NextResponse.json(updatedPlan, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.message },
        { status: 400 },
      );
    }
    if (error instanceof ResourceNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const petShopId = request.headers.get('X-PetShop-ID');

  if (!petShopId) {
    return NextResponse.json({ message: 'ID do PetShop não encontrado no token' }, { status: 401 });
  }

  try {
    const planRepository = new PrismaClientSubscriptionPlanRepository();
    const deactivatePlanUseCase = new DeactivateClientSubscriptionPlanUseCase(planRepository);

    await deactivatePlanUseCase.execute({
      planId: params.id,
      petShopId,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}
