import { z } from 'zod';

export const planCreditsSchema = z.array(
  z.object({
    serviceId: z.cuid(),
    quantity: z.number().int().positive(),
  }),
);

export type PlanCredits = z.infer<typeof planCreditsSchema>;

export interface ClientSubscriptionPlan {
  id: string;
  name: string;
  price: number;
  credits: PlanCredits;
  isActive: boolean;
  petShopId: string;
  createdAt: Date;
  updatedAt: Date;
}
