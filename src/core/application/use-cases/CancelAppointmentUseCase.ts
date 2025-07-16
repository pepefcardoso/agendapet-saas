import { IAppointmentRepository } from '@/core/domain/repositories/IAppointmentRepository';
import { NotAuthorizedError } from './errors/NotAuthorizedError';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';
import { Either, left, right } from '@/utils/either';
import { AppointmentStatus } from '@prisma/client';

interface CancelAppointmentUseCaseRequest {
  clientId: string;
  appointmentId: string;
}

type CancelAppointmentUseCaseResponse = Either<ResourceNotFoundError | NotAuthorizedError, null>;

export class CancelAppointmentUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute({
    clientId,
    appointmentId,
  }: CancelAppointmentUseCaseRequest): Promise<CancelAppointmentUseCaseResponse> {
    const appointment = await this.appointmentRepository.findById(appointmentId);

    if (!appointment) {
      return left(new ResourceNotFoundError('Appointment not found.'));
    }

    if (appointment.clientId.toString() !== clientId) {
      return left(new NotAuthorizedError());
    }

    appointment.status = AppointmentStatus.CANCELLED;

    await this.appointmentRepository.save(appointment);

    return right(null);
  }
}
