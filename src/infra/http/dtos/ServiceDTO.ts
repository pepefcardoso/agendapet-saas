import { z } from 'zod';

export const createServiceBodySchema = z.object({
  name: z.string().min(3),
  duration: z.number().int().positive(),
  price: z.number().positive(),
});

export const updateServiceBodySchema = z.object({
  name: z.string().min(3).optional(),
  duration: z.number().int().positive().optional(),
  price: z.number().positive().optional(),
});

export type CreateServiceDTO = z.infer<typeof createServiceBodySchema>;
export type UpdateServiceDTO = z.infer<typeof updateServiceBodySchema>;
