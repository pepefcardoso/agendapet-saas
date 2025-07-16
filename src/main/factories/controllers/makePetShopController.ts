import { PetShopController } from '@/infra/http/controllers/PetShopController';
import { PrismaPetShopRepository } from '@/infra/database/prisma/repositories/PrismaPetShopRepository';
import { PrismaAppointmentRepository } from '@/infra/database/prisma/repositories/PrismaAppointmentRepository'; // Necessario para ListPetShopAgendaUseCase
import { GetMyPetShopUseCase } from '@/core/application/use-cases/GetMyPetShopUseCase';
import { UpdatePetShopSettingsUseCase } from '@/core/application/use-cases/UpdatePetShopSettingsUseCase';
import { ListPetShopAgendaUseCase } from '@/core/application/use-cases/ListPetShopAgendaUseCase';

/**
 * Cria e retorna uma instância de PetShopController
 * com suas dependências (Use Cases) injetadas.
 */
export function makePetShopController(): PetShopController {
  const petShopRepository = new PrismaPetShopRepository();
  const appointmentRepository = new PrismaAppointmentRepository();

  const getMyPetShopUseCase = new GetMyPetShopUseCase(petShopRepository);
  const updatePetShopSettingsUseCase = new UpdatePetShopSettingsUseCase(petShopRepository);
  const listPetShopAgendaUseCase = new ListPetShopAgendaUseCase(appointmentRepository);

  const petShopController = new PetShopController(
    getMyPetShopUseCase,
    updatePetShopSettingsUseCase,
    listPetShopAgendaUseCase,
  );

  return petShopController;
}
