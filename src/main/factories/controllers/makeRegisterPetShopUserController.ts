import { RegisterPetShopUserController } from '@/infra/http/controllers/RegisterPetShopUserController';
import { PrismaPetShopUserRepository } from '@/infra/database/prisma/repositories/PrismaPetShopUserRepository';
import { PrismaPetShopRepository } from '@/infra/database/prisma/repositories/PrismaPetShopRepository';
import { BcryptHasher } from '@/infra/providers/BcryptHasher';
import { RegisterPetShopUserUseCase } from '@/core/application/use-cases/RegisterPetShopUserUseCase';

/**
 * Cria e retorna uma instância de RegisterPetShopUserController
 * com suas dependências injetadas.
 */
export function makeRegisterPetShopUserController(): RegisterPetShopUserController {
  const petShopUserRepository = new PrismaPetShopUserRepository();
  const petShopRepository = new PrismaPetShopRepository();
  const bcryptHasher = new BcryptHasher();
  const registerPetShopUserUseCase = new RegisterPetShopUserUseCase(
    petShopUserRepository,
    petShopRepository,
    bcryptHasher,
  );

  const registerPetShopUserController = new RegisterPetShopUserController(
    registerPetShopUserUseCase,
  );

  return registerPetShopUserController;
}
