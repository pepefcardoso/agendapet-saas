import { CreateLoyaltyPromotionUseCase } from '@/core/application/use-cases/CreateLoyaltyPromotionUseCase';
import { DeleteLoyaltyPromotionUseCase } from '@/core/application/use-cases/DeleteLoyaltyPromotionUseCase';
import { NotAllowedError } from '@/core/application/use-cases/errors/NotAllowedError';
import { ResourceNotFoundError } from '@/core/application/use-cases/errors/ResourceNotFoundError';
import { ListLoyaltyPromotionsUseCase } from '@/core/application/use-cases/ListLoyaltyPromotionsUseCase';
import { UpdateLoyaltyPromotionUseCase } from '@/core/application/use-cases/UpdateLoyaltyPromotionUseCase';
import { PrismaLoyaltyPlanRepository } from '@/infra/database/prisma/repositories/PrismaLoyaltyPlanRepository';
import { PrismaLoyaltyPromotionRepository } from '@/infra/database/prisma/repositories/PrismaLoyaltyPromotionRepository';
import { createLoyaltyPromotionSchema } from '@/infra/http/dtos/CreateLoyaltyPromotionDTO';
import { updateLoyaltyPromotionSchema } from '@/infra/http/dtos/UpdateLoyaltyPromotionDTO';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

function getDependencies() {
  const loyaltyPlanRepository = new PrismaLoyaltyPlanRepository();
  const loyaltyPromotionRepository = new PrismaLoyaltyPromotionRepository();
  return { loyaltyPlanRepository, loyaltyPromotionRepository };
}

export async function GET(req: NextRequest) {
  try {
    const petShopId = req.headers.get('X-PetShop-ID');
    if (!petShopId) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const { loyaltyPlanRepository, loyaltyPromotionRepository } = getDependencies();
    const useCase = new ListLoyaltyPromotionsUseCase(
      loyaltyPlanRepository,
      loyaltyPromotionRepository,
    );

    const { promotions } = await useCase.execute({ petShopId });

    return NextResponse.json({ promotions }, { status: 200 });
  } catch (error) {
    console.error('[LOYALTY_PROMOTIONS_GET_ERROR]', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const petShopId = req.headers.get('X-PetShop-ID');
    if (!petShopId) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const data = createLoyaltyPromotionSchema.parse(body);

    const { loyaltyPlanRepository, loyaltyPromotionRepository } = getDependencies();
    const useCase = new CreateLoyaltyPromotionUseCase(
      loyaltyPlanRepository,
      loyaltyPromotionRepository,
    );

    const { promotion } = await useCase.execute({ petShopId, ...data });

    return NextResponse.json({ promotion }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: z.treeifyError(error) }, { status: 400 });
    }
    if (error instanceof ResourceNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    console.error('[LOYALTY_PROMOTIONS_POST_ERROR]', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string[] } }) {
  try {
    const petShopId = req.headers.get('X-PetShop-ID');
    if (!petShopId) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const promotionId = params.id[0];
    const body = await req.json();
    const data = updateLoyaltyPromotionSchema.parse(body);

    const { loyaltyPromotionRepository } = getDependencies();
    const useCase = new UpdateLoyaltyPromotionUseCase(loyaltyPromotionRepository);

    const { promotion } = await useCase.execute({ petShopId, promotionId, data });

    return NextResponse.json({ promotion }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.flatten().fieldErrors }, { status: 400 });
    }
    if (error instanceof ResourceNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    if (error instanceof NotAllowedError) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    console.error('[LOYALTY_PROMOTIONS_PUT_ERROR]', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string[] } }) {
  try {
    const petShopId = req.headers.get('X-PetShop-ID');
    if (!petShopId) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const promotionId = params.id[0];

    const { loyaltyPromotionRepository } = getDependencies();
    const useCase = new DeleteLoyaltyPromotionUseCase(loyaltyPromotionRepository);

    await useCase.execute({ petShopId, promotionId });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    if (error instanceof NotAllowedError) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    console.error('[LOYALTY_PROMOTIONS_DELETE_ERROR]', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
