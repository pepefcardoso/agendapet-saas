import { IAppointmentRepository } from '@/core/domain/repositories/IAppointmentRepository';
import { Appointment } from '@prisma/client';

interface IListClientAppointmentsUseCaseRequest {
  clientId: string;
}

interface IListClientAppointmentsUseCaseResponse {
  appointments: Appointment[];
}

export class ListClientAppointmentsUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute({
    clientId,
  }: IListClientAppointmentsUseCaseRequest): Promise<IListClientAppointmentsUseCaseResponse> {
    const appointments = await this.appointmentRepository.findByClientId(clientId);
    return { appointments };
  }
}
