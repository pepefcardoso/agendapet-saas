import { z } from 'zod';
import { createLoyaltyPromotionSchema } from './CreateLoyaltyPromotionDTO';

/**
 * @openapi
 * components:
 * schemas:
 * UpdateLoyaltyPromotionDTO:
 * type: object
 * properties:
 * description:
 * type: string
 * description: "Nova descrição da recompensa."
 * pointsNeeded:
 * type: number
 * description: "Novos pontos necessários para resgatar a promoção."
 * serviceCredits:
 * type: array
 * description: "Novos créditos de serviço oferecidos como recompensa."
 * items:
 * type: object
 * properties:
 * serviceId:
 * type: string
 * format: cuid
 * quantity:
 * type: number
 */
export const updateLoyaltyPromotionSchema = createLoyaltyPromotionSchema.partial();

export type UpdateLoyaltyPromotionDTO = z.infer<typeof updateLoyaltyPromotionSchema>;
