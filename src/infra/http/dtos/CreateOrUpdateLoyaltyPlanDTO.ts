import { z } from 'zod';

/**
 * @openapi
 * components:
 * schemas:
 * CreateOrUpdateLoyaltyPlanDTO:
 * type: object
 * required:
 * - pointsPerReal
 * properties:
 * pointsPerReal:
 * type: number
 * description: "A taxa de conversão de dinheiro para pontos (ex: 1 significa 1 ponto por R$1)."
 * example: 1
 */
export const createOrUpdateLoyaltyPlanSchema = z.object({
  pointsPerReal: z.coerce
    .number({ error: 'A taxa de pontos por real deve ser um número.' })
    .positive({ message: 'A taxa de pontos por real deve ser um número positivo.' }),
});

export type CreateOrUpdateLoyaltyPlanDTO = z.infer<typeof createOrUpdateLoyaltyPlanSchema>;
