import { RatingController } from '@/infra/http/controllers/RatingController';
import { PrismaRatingRepository } from '@/infra/database/prisma/repositories/PrismaRatingRepository';
import { PrismaPetShopRepository } from '@/infra/database/prisma/repositories/PrismaPetShopRepository';
import { PrismaClientUserRepository } from '@/infra/database/prisma/repositories/PrismaClientUserRepository';
import { PrismaAppointmentRepository } from '@/infra/database/prisma/repositories/PrismaAppointmentRepository';
import { CreateRatingUseCase } from '@/core/application/use-cases/CreateRatingUseCase';
import { ListRatingsByPetShopUseCase } from '@/core/application/use-cases/ListRatingsByPetShopUseCase';

/**
 * Cria e retorna uma instância de RatingController
 * com suas dependências (Use Cases) injetadas.
 */
export function makeRatingController(): RatingController {
  const ratingsRepository = new PrismaRatingRepository();
  const petShopsRepository = new PrismaPetShopRepository();
  const clientUsersRepository = new PrismaClientUserRepository();
  const appointmentsRepository = new PrismaAppointmentRepository();

  const createRatingUseCase = new CreateRatingUseCase(
    ratingsRepository,
    petShopsRepository,
    clientUsersRepository,
    appointmentsRepository,
  );

  const listRatingsByPetShopUseCase = new ListRatingsByPetShopUseCase(
    ratingsRepository,
    petShopsRepository,
  );

  const ratingController = new RatingController(createRatingUseCase, listRatingsByPetShopUseCase);

  return ratingController;
}
