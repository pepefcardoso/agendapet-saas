import { LoyaltyPromotion } from '@prisma/client';
import { randomUUID } from 'crypto';

export function makeLoyaltyPromotion(override: Partial<LoyaltyPromotion> = {}): LoyaltyPromotion {
  return {
    id: randomUUID(),
    description: 'Um banho grátis!',
    pointsNeeded: 100,
    serviceCredits: {},
    loyaltyPlanId: randomUUID(),
    ...override,
  };
}