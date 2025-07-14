import { CreateClientSubscriptionPlanUseCase } from '@/core/application/use-cases/CreateClientSubscriptionPlanUseCase';
import { DeactivateClientSubscriptionPlanUseCase } from '@/core/application/use-cases/DeactivateClientSubscriptionPlanUseCase';
import { ResourceNotFoundError } from '@/core/application/use-cases/errors/ResourceNotFoundError';
import { ListClientSubscriptionPlansUseCase } from '@/core/application/use-cases/ListClientSubscriptionPlansUseCase';
import { UpdateClientSubscriptionPlanUseCase } from '@/core/application/use-cases/UpdateClientSubscriptionPlanUseCase';
import { PrismaClientSubscriptionPlanRepository } from '@/infra/database/prisma/repositories/PrismaClientSubscriptionPlanRepository';
import {
  createClientSubscriptionPlanDTO,
  updateClientSubscriptionPlanDTO,
} from '@/infra/http/dtos/ClientSubscriptionPlanDTO';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

function getPetShopIdFromRequest(req: NextRequest): string | null {
  return req.headers.get('X-PetShop-ID');
}

export async function POST(req: NextRequest) {
  try {
    const petShopId = getPetShopIdFromRequest(req);
    if (!petShopId) {
      return NextResponse.json({ message: 'Acesso não autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const data = createClientSubscriptionPlanDTO.parse(body);

    const planRepository = new PrismaClientSubscriptionPlanRepository();
    const useCase = new CreateClientSubscriptionPlanUseCase(planRepository);
    const plan = await useCase.execute({ ...data, petShopId });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validação falhou.', issues: error.format() },
        { status: 400 },
      );
    }
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const petShopId = getPetShopIdFromRequest(req);
  if (!petShopId) {
    return NextResponse.json({ message: 'Acesso não autorizado.' }, { status: 401 });
  }

  const planRepository = new PrismaClientSubscriptionPlanRepository();
  const useCase = new ListClientSubscriptionPlansUseCase(planRepository);
  const plans = await useCase.execute({ petShopId });

  return NextResponse.json(plans, { status: 200 });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string[] } }) {
  try {
    const petShopId = getPetShopIdFromRequest(req);
    if (!petShopId) {
      return NextResponse.json({ message: 'Acesso não autorizado.' }, { status: 401 });
    }

    const planId = params.id[0];
    const body = await req.json();
    const data = updateClientSubscriptionPlanDTO.parse(body);

    const planRepository = new PrismaClientSubscriptionPlanRepository();
    const useCase = new UpdateClientSubscriptionPlanUseCase(planRepository);
    const plan = await useCase.execute({ planId, petShopId, data });

    return NextResponse.json(plan, { status: 200 });
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validação falhou.', issues: error.format() },
        { status: 400 },
      );
    }
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string[] } }) {
  try {
    const petShopId = getPetShopIdFromRequest(req);
    if (!petShopId) {
      return NextResponse.json({ message: 'Acesso não autorizado.' }, { status: 401 });
    }

    const planId = params.id[0];

    const planRepository = new PrismaClientSubscriptionPlanRepository();
    const useCase = new DeactivateClientSubscriptionPlanUseCase(planRepository);
    await useCase.execute({ planId, petShopId });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
