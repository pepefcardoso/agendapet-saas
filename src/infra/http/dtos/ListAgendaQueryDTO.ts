import { z } from 'zod';

export const listAgendaQuerySchema = z.object({
  date: z.coerce.date(),
});

export type ListAgendaQueryDTO = z.infer<typeof listAgendaQuerySchema>;
