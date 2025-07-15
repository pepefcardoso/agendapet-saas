import { NextRequest, NextResponse } from 'next/server';
import { PrismaClientSubscriptionPlanRepository } from '@/infra/database/prisma/repositories/PrismaClientSubscriptionPlanRepository';
import { CreateClientSubscriptionPlanUseCase } from '@/core/application/use-cases/CreateClientSubscriptionPlanUseCase';
import { ListClientSubscriptionPlansUseCase } from '@/core/application/use-cases/ListClientSubscriptionPlansUseCase';
import { createClientSubscriptionPlanSchema } from '@/infra/http/dtos/ClientSubscriptionPlanDTO';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  const petShopId = request.headers.get('X-PetShop-ID');

  if (!petShopId) {
    return NextResponse.json({ message: 'ID do PetShop não encontrado no token' }, { status: 401 });
  }

  try {
    const planRepository = new PrismaClientSubscriptionPlanRepository();
    const listPlansUseCase = new ListClientSubscriptionPlansUseCase(planRepository);

    const plans = await listPlansUseCase.execute({ petShopId });

    return NextResponse.json(plans, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const petShopId = request.headers.get('X-PetShop-ID');

  if (!petShopId) {
    return NextResponse.json({ message: 'ID do PetShop não encontrado no token' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createClientSubscriptionPlanSchema.parse(body);

    const planRepository = new PrismaClientSubscriptionPlanRepository();
    const createPlanUseCase = new CreateClientSubscriptionPlanUseCase(planRepository);

    const newPlan = await createPlanUseCase.execute({
      ...data,
      petShopId,
    });

    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.message },
        { status: 400 },
      );
    }
    console.error(error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}
