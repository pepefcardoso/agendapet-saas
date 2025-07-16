import { Rating } from '@prisma/client';
import { IRatingRepository } from '@/core/domain/repositories/IRatingRepository';
import { IPetShopRepository } from '@/core/domain/repositories/IPetShopRepository';
import { IClientUserRepository } from '@/core/domain/repositories/IClientUserRepository';
import { IAppointmentRepository } from '@/core/domain/repositories/IAppointmentRepository';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';
import { NotAllowedError } from './errors/NotAllowedError';

interface CreateRatingUseCaseRequest {
  petShopId: string;
  clientId: string;
  score: number;
  comment?: string;
}

interface CreateRatingUseCaseResponse {
  rating: Rating;
}

export class CreateRatingUseCase {
  constructor(
    private ratingsRepository: IRatingRepository,
    private petShopsRepository: IPetShopRepository,
    private clientUsersRepository: IClientUserRepository,
    private appointmentsRepository: IAppointmentRepository,
  ) {}

  async execute({
    petShopId,
    clientId,
    score,
    comment,
  }: CreateRatingUseCaseRequest): Promise<CreateRatingUseCaseResponse> {
    const petShop = await this.petShopsRepository.findById(petShopId);

    if (!petShop) {
      throw new ResourceNotFoundError('PetShop not found.');
    }

    const client = await this.clientUsersRepository.findById(clientId);

    if (!client) {
      throw new ResourceNotFoundError('Client user not found.');
    }

    // Validação de Negócio: Verificar se o cliente tem um vínculo com o petshop
    // Pode ser através de um PetShopClient OU de um Appointment concluído.
    const hasCompletedAppointment =
      await this.appointmentsRepository.hasCompletedAppointmentByClientAndPetShop(
        clientId,
        petShopId,
      );

    // Se você tiver um PetShopClientRepository, também poderia verificar:
    // const petShopClient = await this.petShopClientRepository.findByPetShopAndClient(petShopId, clientId);
    // if (!hasCompletedAppointment && !petShopClient) { ... }
    // Por enquanto, vamos usar o Appointment.

    if (!hasCompletedAppointment) {
      throw new NotAllowedError(
        'Você só pode avaliar petshops com os quais já teve agendamentos concluídos.',
      );
    }

    const rating = await this.ratingsRepository.create({
      petShopId,
      clientId,
      score,
      comment,
    });

    return {
      rating,
    };
  }
}
