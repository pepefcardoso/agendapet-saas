import { PrismaClientSubscriptionPlanRepository } from '@/infra/database/prisma/repositories/PrismaClientSubscriptionPlanRepository';
import { CreateClientSubscriptionPlanUseCase } from '@/core/application/use-cases/CreateClientSubscriptionPlanUseCase';
import { ListClientSubscriptionPlansUseCase } from '@/core/application/use-cases/ListClientSubscriptionPlansUseCase';
import { UpdateClientSubscriptionPlanUseCase } from '@/core/application/use-cases/UpdateClientSubscriptionPlanUseCase';
import { DeactivateClientSubscriptionPlanUseCase } from '@/core/application/use-cases/DeactivateClientSubscriptionPlanUseCase';
import { ClientPlanController } from '@/infra/http/controllers/ClientPlanController';

export function makeClientPlanController() {
  const planRepository = new PrismaClientSubscriptionPlanRepository();

  const createPlanUseCase = new CreateClientSubscriptionPlanUseCase(planRepository);
  const listPlansUseCase = new ListClientSubscriptionPlansUseCase(planRepository);
  const updatePlanUseCase = new UpdateClientSubscriptionPlanUseCase(planRepository);
  const deactivatePlanUseCase = new DeactivateClientSubscriptionPlanUseCase(planRepository);

  const controller = new ClientPlanController(
    createPlanUseCase,
    listPlansUseCase,
    updatePlanUseCase,
    deactivatePlanUseCase,
  );

  return controller;
}
