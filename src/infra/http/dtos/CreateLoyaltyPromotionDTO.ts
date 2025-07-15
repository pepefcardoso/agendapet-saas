import { z } from 'zod';

/**
 * @openapi
 * components:
 * schemas:
 * CreateLoyaltyPromotionDTO:
 * type: object
 * required:
 * - description
 * - pointsNeeded
 * - serviceCredits
 * properties:
 * description:
 * type: string
 * description: "Descrição da recompensa."
 * example: "Banho Grátis para Cães de Porte Pequeno"
 * pointsNeeded:
 * type: number
 * description: "Pontos necessários para resgatar a promoção."
 * example: 500
 * serviceCredits:
 * type: array
 * description: "Créditos de serviço oferecidos como recompensa."
 * items:
 * type: object
 * properties:
 * serviceId:
 * type: string
 * format: cuid
 * quantity:
 * type: number
 * example: 1
 */
export const createLoyaltyPromotionSchema = z.object({
  description: z.string().min(3),
  pointsNeeded: z.coerce.number().int().positive(),
  serviceCredits: z
    .array(
      z.object({
        serviceId: z.string().cuid(),
        quantity: z.coerce.number().int().positive(),
      }),
    )
    .min(1, { message: 'Pelo menos um crédito de serviço deve ser fornecido.' }),
});

export type CreateLoyaltyPromotionDTO = z.infer<typeof createLoyaltyPromotionSchema>;
