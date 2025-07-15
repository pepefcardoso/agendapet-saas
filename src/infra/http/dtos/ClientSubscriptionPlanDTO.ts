import { z } from 'zod';

export const createClientSubscriptionPlanSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  price: z.number().positive('O preço deve ser um número positivo.'),
  credits: z.any().refine((val) => typeof val === 'object' && !Array.isArray(val) && val !== null, {
    message: 'Créditos devem ser um objeto JSON.',
  }),
});

export const updateClientSubscriptionPlanSchema = createClientSubscriptionPlanSchema.partial();
