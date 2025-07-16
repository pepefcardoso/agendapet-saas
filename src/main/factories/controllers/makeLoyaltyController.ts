import { PrismaLoyaltyPlanRepository } from '@/infra/database/prisma/repositories/PrismaLoyaltyPlanRepository';
import { PrismaLoyaltyPromotionRepository } from '@/infra/database/prisma/repositories/PrismaLoyaltyPromotionRepository';
import { CreateOrUpdateLoyaltyPlanUseCase } from '@/core/application/use-cases/CreateOrUpdateLoyaltyPlanUseCase';
import { CreateLoyaltyPromotionUseCase } from '@/core/application/use-cases/CreateLoyaltyPromotionUseCase';
import { ListLoyaltyPromotionsUseCase } from '@/core/application/use-cases/ListLoyaltyPromotionsUseCase';
import { UpdateLoyaltyPromotionUseCase } from '@/core/application/use-cases/UpdateLoyaltyPromotionUseCase';
import { DeleteLoyaltyPromotionUseCase } from '@/core/application/use-cases/DeleteLoyaltyPromotionUseCase';
import { LoyaltyController } from '@/infra/http/controllers/LoyaltyController';

export function makeLoyaltyController() {
  const loyaltyPlanRepository = new PrismaLoyaltyPlanRepository();
  const loyaltyPromotionRepository = new PrismaLoyaltyPromotionRepository();

  const createOrUpdateLoyaltyPlanUseCase = new CreateOrUpdateLoyaltyPlanUseCase(
    loyaltyPlanRepository,
  );
  const createLoyaltyPromotionUseCase = new CreateLoyaltyPromotionUseCase(
    loyaltyPlanRepository,
    loyaltyPromotionRepository,
  );
  const listLoyaltyPromotionsUseCase = new ListLoyaltyPromotionsUseCase(
    loyaltyPlanRepository,
    loyaltyPromotionRepository,
  );
  const updateLoyaltyPromotionUseCase = new UpdateLoyaltyPromotionUseCase(
    loyaltyPromotionRepository,
  );
  const deleteLoyaltyPromotionUseCase = new DeleteLoyaltyPromotionUseCase(
    loyaltyPromotionRepository,
  );

  const controller = new LoyaltyController(
    createOrUpdateLoyaltyPlanUseCase,
    createLoyaltyPromotionUseCase,
    listLoyaltyPromotionsUseCase,
    updateLoyaltyPromotionUseCase,
    deleteLoyaltyPromotionUseCase,
  );

  return controller;
}
