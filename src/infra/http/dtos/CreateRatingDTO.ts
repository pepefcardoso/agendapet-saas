import { z } from 'zod';

export const createRatingBodySchema = z.object({
  score: z
    .number()
    .int()
    .min(1, 'A nota deve ser no mínimo 1.')
    .max(5, 'A nota deve ser no máximo 5.'),
  comment: z.string().optional(),
});

export type CreateRatingBodySchema = z.infer<typeof createRatingBodySchema>;
