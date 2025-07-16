import { Appointment, AppointmentStatus, PaymentType, Service } from '@prisma/client';
import {
  IAppointmentRepository,
  CreateAppointmentData,
  AppointmentWithServices,
  PrismaTransactionClient,
} from '@/core/domain/repositories/IAppointmentRepository';
import { randomUUID } from 'node:crypto';
import { startOfDay, endOfDay } from 'date-fns';

export class InMemoryAppointmentRepository implements IAppointmentRepository {
  public items: AppointmentWithServices[] = [];

  async create(data: CreateAppointmentData, tx?: PrismaTransactionClient): Promise<Appointment> {
    const appointment: AppointmentWithServices = {
      id: randomUUID(),
      date: data.date as Date,
      status: AppointmentStatus.PENDING,
      paymentType: data.paymentType as PaymentType,
      clientId: data.clientId,
      petId: data.petId,
      petShopId: data.petShopId,
      services: [],
    };

    // Lógica para conectar serviços seria mais complexa em memória,
    // para testes unitários, basta que o objeto seja compatível com a interface.
    // Se o CreateAppointmentData incluir serviceIds, você pode adicioná-los aqui
    // Se precisar simular serviços específicos, eles teriam que ser adicionados manualmente nos testes.

    this.items.push(appointment);
    return appointment;
  }

  async save(appointment: Appointment, tx?: PrismaTransactionClient): Promise<Appointment> {
    const index = this.items.findIndex((item) => item.id === appointment.id);

    if (index >= 0) {
      // Cria uma nova cópia para evitar mutações diretas do objeto original nos testes
      const updatedAppointment: AppointmentWithServices = {
        ...this.items[index],
        ...appointment,
        services: this.items[index].services || [], // Preserva serviços existentes se não fornecidos
      };
      this.items[index] = updatedAppointment;
      return updatedAppointment;
    }
    throw new Error('Appointment not found'); // Ou retorne null/throw ResourceNotFoundError
  }

  async findById(id: string): Promise<Appointment | null> {
    const appointment = this.items.find((item) => item.id === id);
    return appointment || null;
  }

  async findByClientId(clientId: string): Promise<Appointment[]> {
    return this.items.filter((item) => item.clientId === clientId);
  }

  async findManyByPetShopIdOnDate(
    petShopId: string,
    date: Date,
  ): Promise<AppointmentWithServices[]> {
    const start = startOfDay(date);
    const end = endOfDay(date);

    return this.items.filter((item) => {
      return item.petShopId === petShopId && item.date >= start && item.date <= end;
    });
  }

  async findConflictingAppointment(
    petShopId: string,
    startTime: Date,
    endTime: Date,
    tx?: PrismaTransactionClient,
  ): Promise<Appointment | null> {
    // A lógica de conflito em memória é mais complexa e
    // para testes unitários, pode ser simulada com dados controlados.
    // Aqui, apenas um placeholder para satisfazer a interface.
    return null;
  }

  async hasCompletedAppointmentByClientAndPetShop(
    clientId: string,
    petShopId: string,
  ): Promise<boolean> {
    const appointment = this.items.find(
      (item) =>
        item.clientId === clientId &&
        item.petShopId === petShopId &&
        item.status === AppointmentStatus.COMPLETED,
    );
    return !!appointment;
  }
}
