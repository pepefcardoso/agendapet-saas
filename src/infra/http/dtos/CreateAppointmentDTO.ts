import { PaymentType } from '@prisma/client';
import { z } from 'zod';

export const createAppointmentBodySchema = z
  .object({
    petShopId: z.cuid(),
    petId: z.cuid(),
    startTime: z.coerce.date(),
    serviceIds: z.array(z.string()).min(1, 'É necessário selecionar pelo menos um serviço.'),
    paymentType: z.enum(PaymentType),
    loyaltyPromotionId: z.string().cuid().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.paymentType === 'LOYALTY_CREDIT') {
        return !!data.loyaltyPromotionId;
      }
      return true;
    },
    {
      message: 'loyaltyPromotionId is required for LOYALTY_CREDIT payment type',
      path: ['loyaltyPromotionId'],
    },
  );

export type CreateAppointmentDTO = z.infer<typeof createAppointmentBodySchema>;
