import { z } from 'zod';
import { PetSize } from '@prisma/client';

export const createPetBodySchema = z.object({
  name: z.string().min(2, { message: 'O nome do pet precisa ter no mínimo 2 caracteres.' }),
  size: z.enum(PetSize).refine((val) => Object.values(PetSize).includes(val), {
    message: 'O porte do pet deve ser PEQUENO, MEDIO ou GRANDE.',
  }),
});

export const updatePetBodySchema = createPetBodySchema.partial();

export type CreatePetDTO = z.infer<typeof createPetBodySchema>;
export type UpdatePetDTO = z.infer<typeof updatePetBodySchema>;
