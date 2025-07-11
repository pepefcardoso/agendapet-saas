import { z } from 'zod';

/**
 * @openapi
 * components:
 * schemas:
 * AuthenticateBody:
 * type: object
 * required:
 * - email
 * - password
 * properties:
 * email:
 * type: string
 * format: email
 * description: O e-mail do usuário para autenticação.
 * example: 'johndoe@example.com'
 * password:
 * type: string
 * format: password
 * description: A senha do usuário.
 * example: 'password123'
 * minLength: 6
 */
export const authenticateUserBodySchema = z.object({
  email: z.email({ message: 'Formato de e-mail inválido.' }),
  password: z.string().min(6, { message: 'A senha precisa ter no mínimo 6 caracteres.' }),
});

export type AuthenticateUserDTO = z.infer<typeof authenticateUserBodySchema>;
