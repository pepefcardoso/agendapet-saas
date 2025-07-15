import { CreateOrUpdateLoyaltyPlanUseCase } from '@/core/application/use-cases/CreateOrUpdateLoyaltyPlanUseCase';
import { PrismaLoyaltyPlanRepository } from '@/infra/database/prisma/repositories/PrismaLoyaltyPlanRepository';
import { createOrUpdateLoyaltyPlanSchema } from '@/infra/http/dtos/CreateOrUpdateLoyaltyPlanDTO';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function PUT(req: NextRequest) {
  try {
    const petShopId = req.headers.get('X-PetShop-ID');

    if (!petShopId) {
      return NextResponse.json(
        { message: 'Não autorizado: ID do PetShop não fornecido.' },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { pointsPerReal } = createOrUpdateLoyaltyPlanSchema.parse(body);

    const loyaltyPlanRepository = new PrismaLoyaltyPlanRepository();
    const useCase = new CreateOrUpdateLoyaltyPlanUseCase(loyaltyPlanRepository);

    const { loyaltyPlan } = await useCase.execute({ petShopId, pointsPerReal });

    return NextResponse.json({ loyaltyPlan }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error('[LOYALTY_PLAN_PUT_ERROR]', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
