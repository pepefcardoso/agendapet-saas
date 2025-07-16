import { PetController } from '@/infra/http/controllers/PetController';
import { PrismaPetRepository } from '@/infra/database/prisma/repositories/PrismaPetRepository';
import { CreatePetUseCase } from '@/core/application/use-cases/CreatePetUseCase';
import { ListMyPetsUseCase } from '@/core/application/use-cases/ListMyPetsUseCase';
import { UpdatePetUseCase } from '@/core/application/use-cases/UpdatePetUseCase';
import { DeletePetUseCase } from '@/core/application/use-cases/DeletePetUseCase';

/**
 * Cria e retorna uma instância de PetController
 * com suas dependências (Use Cases) injetadas.
 */
export function makePetController(): PetController {
  const petRepository = new PrismaPetRepository();

  const createPetUseCase = new CreatePetUseCase(petRepository);
  const listMyPetsUseCase = new ListMyPetsUseCase(petRepository);
  const updatePetUseCase = new UpdatePetUseCase(petRepository);
  const deletePetUseCase = new DeletePetUseCase(petRepository);

  const petController = new PetController(
    createPetUseCase,
    listMyPetsUseCase,
    updatePetUseCase,
    deletePetUseCase,
  );

  return petController;
}
