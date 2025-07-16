import { ServiceController } from '@/infra/http/controllers/ServiceController';
import { PrismaServiceRepository } from '@/infra/database/prisma/repositories/PrismaServiceRepository';
import { CreateServiceUseCase } from '@/core/application/use-cases/CreateServiceUseCase';
import { ListServicesByPetShopUseCase } from '@/core/application/use-cases/ListServicesByPetShopUseCase';
import { UpdateServiceUseCase } from '@/core/application/use-cases/UpdateServiceUseCase';
import { DeleteServiceUseCase } from '@/core/application/use-cases/DeleteServiceUseCase';

/**
 * Cria e retorna uma instância de ServiceController
 * com suas dependências (Use Cases) injetadas.
 */
export function makeServiceController(): ServiceController {
  const serviceRepository = new PrismaServiceRepository();

  const createServiceUseCase = new CreateServiceUseCase(serviceRepository);
  const listServicesByPetShopUseCase = new ListServicesByPetShopUseCase(serviceRepository);
  const updateServiceUseCase = new UpdateServiceUseCase(serviceRepository);
  const deleteServiceUseCase = new DeleteServiceUseCase(serviceRepository);

  const serviceController = new ServiceController(
    createServiceUseCase,
    listServicesByPetShopUseCase,
    updateServiceUseCase,
    deleteServiceUseCase,
  );

  return serviceController;
}
