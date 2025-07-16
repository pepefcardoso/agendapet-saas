import { RegisterClientUserController } from '@/infra/http/controllers/RegisterClientUserController';
import { PrismaClientUserRepository } from '@/infra/database/prisma/repositories/PrismaClientUserRepository';
import { RegisterClientUserUseCase } from '@/core/application/use-cases/RegisterClientUserUseCase';
import { BcryptHasher } from '@/infra/providers/BcryptHasher';

/**
 * Cria e retorna uma instância de RegisterClientUserController
 * com suas dependências injetadas.
 */
export function makeRegisterClientUserController(): RegisterClientUserController {
  const clientUserRepository = new PrismaClientUserRepository();

  const bcryptHasher = new BcryptHasher();

  const registerClientUserUseCase = new RegisterClientUserUseCase(
    clientUserRepository,
    bcryptHasher,
  );

  const registerClientUserController = new RegisterClientUserController(registerClientUserUseCase);

  return registerClientUserController;
}
