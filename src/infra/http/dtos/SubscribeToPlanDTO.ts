import { z } from 'zod';

export const subscribeToPlanSchema = z.object({
  planId: z.cuid('Invalid plan ID format.'),
});

export type SubscribeToPlanDTO = z.infer<typeof subscribeToPlanSchema>;
