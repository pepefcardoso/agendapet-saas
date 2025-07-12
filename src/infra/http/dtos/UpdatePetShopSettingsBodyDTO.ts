import { z } from 'zod';

export const updatePetShopSettingsBodySchema = z
  .object({
    name: z.string().min(3, { message: 'O nome precisa ter no mínimo 3 caracteres.' }),
    address: z.string().min(5, { message: 'O endereço precisa ter no mínimo 5 caracteres.' }),
    phone: z.string().min(10, { message: 'O telefone precisa ser válido.' }),
    workingHours: z.any(),
  })
  .partial();

export type UpdatePetShopSettingsBodyDTO = z.infer<typeof updatePetShopSettingsBodySchema>;
