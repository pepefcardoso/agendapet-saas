// src/main/factories/controllers/makeAuthenticateClientUserController.ts
import { AuthenticateClientUserController } from '@/infra/http/controllers/AuthenticateClientUserController';
import { PrismaClientUserRepository } from '@/infra/database/prisma/repositories/PrismaClientUserRepository';
import { JwtService } from '@/infra/providers/JwtService';
import { AuthenticateClientUserUseCase } from '@/core/application/use-cases/AuthenticateClientUserUseCase';

/**
 * Cria e retorna uma instância de AuthenticateClientUserController
 * com suas dependências injetadas.
 */
export function makeAuthenticateClientUserController(): AuthenticateClientUserController {
  // 1. Instanciação dos repositórios
  const clientUserRepository = new PrismaClientUserRepository();

  // 2. Instanciação dos serviços
  const jwtService = new JwtService();

  // 3. Instanciação do Use Case, injetando seus próprios repositórios/serviços
  const authenticateUseCase = new AuthenticateClientUserUseCase(clientUserRepository, jwtService);

  // 4. Instanciação do Controller, injetando o Use Case
  const authenticateClientUserController = new AuthenticateClientUserController(
    authenticateUseCase,
  );

  return authenticateClientUserController;
}
