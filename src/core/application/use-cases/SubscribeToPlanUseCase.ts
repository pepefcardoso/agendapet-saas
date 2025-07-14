import { IClientSubscriptionCreditRepository } from '@/core/domain/repositories/IClientSubscriptionCreditRepository';
import { IClientSubscriptionPlanRepository } from '@/core/domain/repositories/IClientSubscriptionPlanRepository';
import { IClientSubscriptionRepository } from '@/core/domain/repositories/IClientSubscriptionRepository';
import { IDatabaseTransaction } from '@/infra/database/IDatabaseTransaction';
import { ClientSubscription } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';
import { PlanNotActiveError } from './errors/PlanNotActiveError';
import { AlreadySubscribedError } from './errors/AlreadySubscribedError';

interface SubscribeToPlanUseCaseRequest {
  clientId: string;
  planId: string;
}

type SubscribeToPlanUseCaseResponse = ClientSubscription;

export class SubscribeToPlanUseCase {
  constructor(
    private readonly planRepository: IClientSubscriptionPlanRepository,
    private readonly subscriptionRepository: IClientSubscriptionRepository,
    private readonly creditRepository: IClientSubscriptionCreditRepository,
    private readonly dbTransaction: IDatabaseTransaction,
  ) {}

  async execute({
    clientId,
    planId,
  }: SubscribeToPlanUseCaseRequest): Promise<SubscribeToPlanUseCaseResponse> {
    const plan = await this.planRepository.findById(planId);
    if (!plan) {
      throw new ResourceNotFoundError();
    }
    if (!plan.isActive) {
      throw new PlanNotActiveError();
    }

    const existingSubscription = await this.subscriptionRepository.findActiveByClientAndPlan(
      clientId,
      planId,
    );
    if (existingSubscription) {
      throw new AlreadySubscribedError();
    }

    const result = await this.dbTransaction.run(async (transaction: Prisma.TransactionClient) => {
      console.log(`MOCK: Processando pagamento para o plano ${plan.name}...`);

      const renewalDate = new Date();
      renewalDate.setMonth(renewalDate.getMonth() + 1);

      const subscription = await this.subscriptionRepository.create(
        { clientId, planId, renewalDate },
        transaction,
      );

      const creditsToCreate = plan.credits.map((credit) => ({
        subscriptionId: subscription.id,
        serviceId: credit.serviceId,
        remainingCredits: credit.quantity,
      }));

      if (creditsToCreate.length > 0) {
        await this.creditRepository.createMany(creditsToCreate, transaction);
      }

      return subscription;
    });

    return result;
  }
}
