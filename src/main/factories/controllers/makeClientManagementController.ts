import { ClientManagementController } from '@/infra/http/controllers/ClientManagementController';
import { PrismaClientUserRepository } from '@/infra/database/prisma/repositories/PrismaClientUserRepository';
import { PrismaPetShopClientRepository } from '@/infra/database/prisma/repositories/PrismaPetShopClientRepository';
import { AddClientToPetShopUseCase } from '@/core/application/use-cases/AddClientToPetShopUseCase';
import { ListPetShopClientsUseCase } from '@/core/application/use-cases/ListPetShopClientsUseCase';

/**
 * Cria e retorna uma instância de ClientManagementController
 * com suas dependências (Use Cases) injetadas.
 */
export function makeClientManagementController(): ClientManagementController {
  const clientUserRepository = new PrismaClientUserRepository();
  const petShopClientRepository = new PrismaPetShopClientRepository();

  const addClientToPetShopUseCase = new AddClientToPetShopUseCase(
    clientUserRepository,
    petShopClientRepository,
  );
  const listPetShopClientsUseCase = new ListPetShopClientsUseCase(petShopClientRepository);

  const clientManagementController = new ClientManagementController(
    addClientToPetShopUseCase,
    listPetShopClientsUseCase,
  );

  return clientManagementController;
}
