import { z } from 'zod';

export const addClientBodySchema = z.object({
  name: z.string().min(3, { message: 'O nome precisa ter no mínimo 3 caracteres.' }),
  email: z.email({ message: 'Formato de e-mail inválido.' }),
});

export type AddClientDTO = z.infer<typeof addClientBodySchema>;
