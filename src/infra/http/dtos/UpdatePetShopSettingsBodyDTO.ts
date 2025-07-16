import { z } from 'zod';
import { workingHoursSchema } from '@/core/domain/types/WorkingHours';

export const updatePetShopSettingsBodySchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  workingHours: workingHoursSchema.optional(),
});

export type UpdatePetShopSettingsBodyDTO = z.infer<typeof updatePetShopSettingsBodySchema>;
