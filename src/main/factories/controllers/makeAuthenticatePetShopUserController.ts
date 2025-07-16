// src/main/factories/controllers/makeAuthenticatePetShopUserController.ts
import { AuthenticatePetShopUserController } from '@/infra/http/controllers/AuthenticatePetShopUserController';
import { PrismaPetShopUserRepository } from '@/infra/database/prisma/repositories/PrismaPetShopUserRepository';
import { JwtService } from '@/infra/providers/JwtService';
import { AuthenticatePetShopUserUseCase } from '@/core/application/use-cases/AuthenticatePetShopUserUseCase';

/**
 * Cria e retorna uma instância de AuthenticatePetShopUserController
 * com suas dependências injetadas.
 */
export function makeAuthenticatePetShopUserController(): AuthenticatePetShopUserController {
  // 1. Instanciação dos repositórios
  const petShopUserRepository = new PrismaPetShopUserRepository();

  // 2. Instanciação dos serviços
  const jwtService = new JwtService();

  // 3. Instanciação do Use Case, injetando seus próprios repositórios/serviços
  const authenticateUseCase = new AuthenticatePetShopUserUseCase(petShopUserRepository, jwtService);

  // 4. Instanciação do Controller, injetando o Use Case
  const authenticatePetShopUserController = new AuthenticatePetShopUserController(
    authenticateUseCase,
  );

  return authenticatePetShopUserController;
}
