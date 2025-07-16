import { z } from 'zod';

const creditSchema = z.object({
  serviceId: z.cuid({ message: 'O ID do serviço deve ser um CUID válido.' }),
  quantity: z
    .number({ error: 'A quantidade de créditos deve ser um número.' })
    .int()
    .positive({ message: 'A quantidade de créditos deve ser maior que zero.' }),
});

export const createClientSubscriptionPlanSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  price: z.number().positive('O preço deve ser um número positivo.'),
  credits: z
    .array(creditSchema)
    .min(1, { message: 'É necessário fornecer pelo menos um tipo de crédito.' }),
});

export const updateClientSubscriptionPlanSchema = createClientSubscriptionPlanSchema.partial();
