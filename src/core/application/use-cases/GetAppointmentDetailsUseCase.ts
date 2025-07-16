import { Either, left, right } from '@/utils/either';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';
import { NotAuthorizedError } from './errors/NotAuthorizedError';
import { Appointment } from '@prisma/client';
import { IAppointmentRepository } from '@/core/domain/repositories/IAppointmentRepository';

interface GetAppointmentDetailsUseCaseRequest {
  clientId: string;
  appointmentId: string;
}

type GetAppointmentDetailsUseCaseResponse = Either<
  ResourceNotFoundError | NotAuthorizedError,
  {
    appointment: Appointment;
  }
>;

export class GetAppointmentDetailsUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute({
    clientId,
    appointmentId,
  }: GetAppointmentDetailsUseCaseRequest): Promise<GetAppointmentDetailsUseCaseResponse> {
    const appointment = await this.appointmentRepository.findById(appointmentId);

    if (!appointment) {
      return left(new ResourceNotFoundError('Appointment not found.'));
    }

    if (appointment.clientId.toString() !== clientId) {
      return left(new NotAuthorizedError());
    }

    return right({
      appointment,
    });
  }
}
