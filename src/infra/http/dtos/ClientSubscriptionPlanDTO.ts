import { planCreditsSchema } from '@/core/domain/entities/ClientSubscriptionPlan';
import { z } from 'zod';

export const createClientSubscriptionPlanDTO = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres.'),
  price: z.number().positive('O preço deve ser um valor positivo.'),
  credits: planCreditsSchema,
});

export const updateClientSubscriptionPlanDTO = z
  .object({
    name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres.'),
    price: z.number().positive('O preço deve ser um valor positivo.'),
    credits: planCreditsSchema,
  })
  .partial();
