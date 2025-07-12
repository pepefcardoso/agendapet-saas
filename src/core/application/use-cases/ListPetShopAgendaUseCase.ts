import {
  IAppointmentRepository,
  AppointmentWithServices,
} from '@/core/domain/repositories/IAppointmentRepository';

interface IListPetShopAgendaUseCaseRequest {
  petShopId: string;
  date: Date;
}

interface IListPetShopAgendaUseCaseResponse {
  appointments: AppointmentWithServices[];
}

export class ListPetShopAgendaUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute({
    petShopId,
    date,
  }: IListPetShopAgendaUseCaseRequest): Promise<IListPetShopAgendaUseCaseResponse> {
    const appointments = await this.appointmentRepository.findManyByPetShopIdOnDate(
      petShopId,
      date,
    );
    return { appointments };
  }
}
