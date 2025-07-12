import { z } from 'zod';

export const createAppointmentBodySchema = z.object({
  petShopId: z.cuid(),
  petId: z.cuid(),
  startTime: z.coerce.date(),
  serviceIds: z.array(z.cuid()).min(1, {
    message: 'É necessário selecionar pelo menos um serviço.',
  }),
});

export type CreateAppointmentDTO = z.infer<typeof createAppointmentBodySchema>;
