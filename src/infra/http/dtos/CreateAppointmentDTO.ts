import { z } from 'zod';

const PaymentTypeEnum = z.enum(['MONETARY', 'SUBSCRIPTION_CREDIT', 'LOYALTY_CREDIT']);

export const createAppointmentSchema = z
  .object({
    petId: z.cuid('O ID do pet deve ser um CUID válido.'),
    petShopId: z.cuid('O ID do petshop deve ser um CUID válido.'),
    services: z
      .array(z.cuid('Cada ID de serviço deve ser um CUID válido.'))
      .min(1, 'Pelo menos um serviço deve ser selecionado.'),
    appointmentDate: z.coerce.date({
      error: () => ({ message: 'A data do agendamento é inválida.' }),
    }),
    paymentType: PaymentTypeEnum,
    loyaltyPromotionId: z
      .cuid('O ID da promoção de fidelidade deve ser um CUID válido.')
      .optional(),
  })
  .refine(
    (data) => {
      if (data.paymentType === 'LOYALTY_CREDIT') {
        return !!data.loyaltyPromotionId;
      }
      return true;
    },
    {
      message: 'O ID da promoção de fidelidade é obrigatório para pagamento com pontos.',
      path: ['loyaltyPromotionId'],
    },
  );
