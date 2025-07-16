import { z } from 'zod';

// Define a estrutura para um único slot de tempo (ex: "09:00-18:00")
const timeSlotSchema = z
  .string()
  .regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, 'Formato inválido para o slot de tempo (HH:MM-HH:MM)');

// Define a estrutura para os horários de trabalho de um único dia (array de 1 a 4 slots de tempo)
const dayWorkingHoursSchema = z
  .array(timeSlotSchema)
  .min(1, 'Um dia de trabalho deve ter pelo menos um intervalo de tempo')
  .max(4, 'Um dia de trabalho pode ter no máximo 4 intervalos de tempo.'); // <-- Limite de 1 a 4 horários

// Define o esquema completo para os horários de funcionamento da semana
export const workingHoursSchema = z
  .object({
    monday: dayWorkingHoursSchema.optional(),
    tuesday: dayWorkingHoursSchema.optional(),
    wednesday: dayWorkingHoursSchema.optional(),
    thursday: dayWorkingHoursSchema.optional(),
    friday: dayWorkingHoursSchema.optional(),
    saturday: dayWorkingHoursSchema.optional(),
    sunday: dayWorkingHoursSchema.optional(),
  })
  .partial();

export type WorkingHours = z.infer<typeof workingHoursSchema>;
