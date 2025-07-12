import { z } from 'zod';

export const registerPetShopUserBodySchema = z.object({
  petShopName: z
    .string()
    .min(3, { message: 'O nome do petshop precisa ter no mínimo 3 caracteres.' }),
  name: z.string().min(3, { message: 'O nome do usuário precisa ter no mínimo 3 caracteres.' }),
  email: z.email({ message: 'Formato de e-mail inválido.' }),
  password: z.string().min(6, { message: 'A senha precisa ter no mínimo 6 caracteres.' }),
});

export type RegisterPetShopUserDTO = z.infer<typeof registerPetShopUserBodySchema>;
