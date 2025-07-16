import { AppointmentController } from '@/infra/http/controllers/AppointmentController';
import { PrismaAppointmentRepository } from '@/infra/database/prisma/repositories/PrismaAppointmentRepository';
import { PrismaPetShopRepository } from '@/infra/database/prisma/repositories/PrismaPetShopRepository';
import { PrismaServiceRepository } from '@/infra/database/prisma/repositories/PrismaServiceRepository';
import { PrismaClientSubscriptionCreditRepository } from '@/infra/database/prisma/repositories/PrismaClientSubscriptionCreditRepository';
import { PrismaClientLoyaltyPointsRepository } from '@/infra/database/prisma/repositories/PrismaClientLoyaltyPointsRepository';
import { PrismaLoyaltyPromotionRepository } from '@/infra/database/prisma/repositories/PrismaLoyaltyPromotionRepository';
import { CreateAppointmentUseCase } from '@/core/application/use-cases/CreateAppointmentUseCase';
import { ListClientAppointmentsUseCase } from '@/core/application/use-cases/ListClientAppointmentsUseCase';

export function makeAppointmentController(): AppointmentController {
  const appointmentRepository = new PrismaAppointmentRepository();
  const petShopRepository = new PrismaPetShopRepository();
  const serviceRepository = new PrismaServiceRepository();
  const clientCreditRepo = new PrismaClientSubscriptionCreditRepository();
  const loyaltyPointsRepo = new PrismaClientLoyaltyPointsRepository();
  const loyaltyPromoRepo = new PrismaLoyaltyPromotionRepository();

  const createAppointmentUseCase = new CreateAppointmentUseCase(
    appointmentRepository,
    petShopRepository,
    serviceRepository,
    clientCreditRepo,
    loyaltyPointsRepo,
    loyaltyPromoRepo,
  );
  const listClientAppointmentsUseCase = new ListClientAppointmentsUseCase(appointmentRepository);

  return new AppointmentController(createAppointmentUseCase, listClientAppointmentsUseCase);
}
