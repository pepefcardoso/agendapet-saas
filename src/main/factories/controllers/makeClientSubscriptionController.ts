// src/main/factories/controllers/makeClientSubscriptionController.ts
import { ClientSubscriptionController } from '@/infra/http/controllers/ClientSubscriptionController';
import { PrismaClientSubscriptionPlanRepository } from '@/infra/database/prisma/repositories/PrismaClientSubscriptionPlanRepository';
import { PrismaClientSubscriptionRepository } from '@/infra/database/prisma/repositories/PrismaClientSubscriptionRepository';
import { SubscribeToPlanUseCase } from '@/core/application/use-cases/SubscribeToPlanUseCase';
import { CancelClientSubscriptionUseCase } from '@/core/application/use-cases/CancelClientSubscriptionUseCase';

/**
 * Cria e retorna uma instância de ClientSubscriptionController
 * com suas dependências (Use Cases) injetadas.
 */
export function makeClientSubscriptionController(): ClientSubscriptionController {
  const clientSubscriptionPlanRepository = new PrismaClientSubscriptionPlanRepository();
  const clientSubscriptionRepository = new PrismaClientSubscriptionRepository();

  const subscribeToPlanUseCase = new SubscribeToPlanUseCase(
    clientSubscriptionRepository,
    clientSubscriptionPlanRepository,
  );
  const cancelClientSubscriptionUseCase = new CancelClientSubscriptionUseCase(
    clientSubscriptionRepository,
  );

  const clientSubscriptionController = new ClientSubscriptionController(
    subscribeToPlanUseCase,
    cancelClientSubscriptionUseCase,
  );

  return clientSubscriptionController;
}
