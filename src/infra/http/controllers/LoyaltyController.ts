import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CreateOrUpdateLoyaltyPlanUseCase } from '@/core/application/use-cases/CreateOrUpdateLoyaltyPlanUseCase';
import { CreateLoyaltyPromotionUseCase } from '@/core/application/use-cases/CreateLoyaltyPromotionUseCase';
import { DeleteLoyaltyPromotionUseCase } from '@/core/application/use-cases/DeleteLoyaltyPromotionUseCase';
import { ListLoyaltyPromotionsUseCase } from '@/core/application/use-cases/ListLoyaltyPromotionsUseCase';
import { UpdateLoyaltyPromotionUseCase } from '@/core/application/use-cases/UpdateLoyaltyPromotionUseCase';
import { NotAllowedError } from '@/core/application/use-cases/errors/NotAllowedError';
import { ResourceNotFoundError } from '@/core/application/use-cases/errors/ResourceNotFoundError';
import { createOrUpdateLoyaltyPlanSchema } from '@/infra/http/dtos/CreateOrUpdateLoyaltyPlanDTO';
import { createLoyaltyPromotionSchema } from '@/infra/http/dtos/CreateLoyaltyPromotionDTO';
import { updateLoyaltyPromotionSchema } from '@/infra/http/dtos/UpdateLoyaltyPromotionDTO';

export class LoyaltyController {
  constructor(
    private createOrUpdateLoyaltyPlanUseCase: CreateOrUpdateLoyaltyPlanUseCase,
    private createLoyaltyPromotionUseCase: CreateLoyaltyPromotionUseCase,
    private listLoyaltyPromotionsUseCase: ListLoyaltyPromotionsUseCase,
    private updateLoyaltyPromotionUseCase: UpdateLoyaltyPromotionUseCase,
    private deleteLoyaltyPromotionUseCase: DeleteLoyaltyPromotionUseCase,
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

  async createOrUpdatePlan(request: NextRequest) {
    try {
      const petShopId = this.getPetShopId(request);
      if (!petShopId) return this.handleAuthError();

      const body = await request.json();
      const { pointsPerReal } = createOrUpdateLoyaltyPlanSchema.parse(body);

      const { loyaltyPlan } = await this.createOrUpdateLoyaltyPlanUseCase.execute({
        petShopId,
        pointsPerReal,
      });

      return NextResponse.json({ loyaltyPlan }, { status: 200 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ errors: error.flatten().fieldErrors }, { status: 400 });
      }
      console.error('[LOYALTY_PLAN_PUT_ERROR]', error);
      return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
    }
  }

  async createPromotion(request: NextRequest) {
    try {
      const petShopId = this.getPetShopId(request);
      if (!petShopId) return this.handleAuthError();

      const body = await request.json();
      const data = createLoyaltyPromotionSchema.parse(body);
      const { promotion } = await this.createLoyaltyPromotionUseCase.execute({
        petShopId,
        ...data,
      });

      return NextResponse.json({ promotion }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ errors: error.flatten().fieldErrors }, { status: 400 });
      }
      if (error instanceof ResourceNotFoundError) {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
      console.error('[LOYALTY_PROMOTIONS_POST_ERROR]', error);
      return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
    }
  }

  async listPromotions(request: NextRequest) {
    try {
      const petShopId = this.getPetShopId(request);
      if (!petShopId) return this.handleAuthError();

      const { promotions } = await this.listLoyaltyPromotionsUseCase.execute({ petShopId });
      return NextResponse.json({ promotions }, { status: 200 });
    } catch (error) {
      console.error('[LOYALTY_PROMOTIONS_GET_ERROR]', error);
      return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
    }
  }

  async updatePromotion(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const petShopId = this.getPetShopId(request);
      if (!petShopId) return this.handleAuthError();

      const promotionId = params.id;
      const body = await request.json();
      const data = updateLoyaltyPromotionSchema.parse(body);

      const { promotion } = await this.updateLoyaltyPromotionUseCase.execute({
        petShopId,
        promotionId,
        data,
      });

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

  async deletePromotion(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const petShopId = this.getPetShopId(request);
      if (!petShopId) return this.handleAuthError();

      const promotionId = params.id;
      await this.deleteLoyaltyPromotionUseCase.execute({ petShopId, promotionId });

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
}
