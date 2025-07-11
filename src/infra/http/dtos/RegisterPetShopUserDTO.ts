import { z } from 'zod';
import { Role } from '@prisma/client'

export const registerPetShopUserBodySchema = z.object({
  name: z.string().min(3, { message: 'O nome precisa ter no mínimo 3 caracteres.' }),
  email: z.email({ message: 'Formato de e-mail inválido.' }),
  password: z.string().min(6, { message: 'A senha precisa ter no mínimo 6 caracteres.' }),
  petShopId: z.cuid({ message: 'ID do Petshop inválido.' }),
  role: z.enum(Role, { message: 'O cargo precisa ser ADMIN ou EMPLOYEE.' }),
});

export type RegisterPetShopUserDTO = z.infer<typeof registerPetShopUserBodySchema>;
