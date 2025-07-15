import { IClientSubscriptionRepository } from '@/core/domain/repositories/IClientSubscriptionRepository';
import { IClientSubscriptionPlanRepository } from '@/core/domain/repositories/IClientSubscriptionPlanRepository';
import { ClientSubscription, SubscriptionStatus } from '@prisma/client';
import { IUseCase } from './IUseCase';
import { z } from 'zod';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';
import { SubscriptionFailedError } from './errors/SubscriptionFailedError';

interface ISubscribeToPlanRequestDTO {
  clientId: string;
  planId: string;
}

const planCreditsSchema = z.array(
  z.object({
    serviceId: z.cuid('O ID do serviço deve ser um CUID válido.'),
    quantity: z.number().int().positive('A quantidade deve ser um inteiro positivo.'),
  }),
);

export class SubscribeToPlanUseCase
  implements IUseCase<ISubscribeToPlanRequestDTO, ClientSubscription>
{
  constructor(
    private clientSubscriptionRepository: IClientSubscriptionRepository,
    private clientSubscriptionPlanRepository: IClientSubscriptionPlanRepository,
  ) {}

  async execute({ clientId, planId }: ISubscribeToPlanRequestDTO): Promise<ClientSubscription> {
    const plan = await this.clientSubscriptionPlanRepository.findById(planId);
    if (!plan) {
      throw new ResourceNotFoundError();
    }

    const existingActiveSubscription =
      await this.clientSubscriptionRepository.findActiveByClientAndPlan(clientId, planId);
    if (existingActiveSubscription) {
      throw new SubscriptionFailedError();
    }

    const renewalDate = new Date();
    renewalDate.setDate(renewalDate.getDate() + 30);

    const subscriptionData = {
      clientId,
      planId,
      status: SubscriptionStatus.ACTIVE,
      renewalDate,
    };

    const creditsParseResult = planCreditsSchema.safeParse(plan.credits);
    if (!creditsParseResult.success) {
      console.error('Erro de validação dos créditos do plano:', creditsParseResult.error.message);
      throw new SubscriptionFailedError();
    }
    const creditsJson = creditsParseResult.data;

    const creditsData = creditsJson.map((credit) => ({
      serviceId: credit.serviceId,
      remainingCredits: credit.quantity,
    }));

    try {
      const newSubscription = await this.clientSubscriptionRepository.createWithCredits(
        subscriptionData,
        creditsData,
      );
      return newSubscription;
    } catch (error) {
      console.error('Erro na transação ao criar assinatura:', error);
      throw new SubscriptionFailedError();
    }
  }
}
