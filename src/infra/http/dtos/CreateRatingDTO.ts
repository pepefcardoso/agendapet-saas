import { z } from 'zod';

export const createRatingBodySchema = z.object({
  comment: z.string().max(500, 'O comentário não pode ter mais de 500 caracteres.').optional(),
  score: z
    .number({ error: 'A nota é obrigatória.' })
    .int({ message: 'A nota deve ser um número inteiro.' })
    .min(1, { message: 'A nota mínima é 1.' })
    .max(5, { message: 'A nota máxima é 5.' }),
});

export type CreateRatingBodySchema = z.infer<typeof createRatingBodySchema>;
