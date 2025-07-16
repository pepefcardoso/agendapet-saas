import {
  IAppointmentRepository,
  CreateAppointmentData,
  AppointmentWithServices,
  PrismaTransactionClient,
} from '@/core/domain/repositories/IAppointmentRepository';
import { Appointment } from '@prisma/client';
import { randomUUID } from 'crypto';

export class InMemoryAppointmentRepository implements IAppointmentRepository {
  public items: AppointmentWithServices[] = [];

  async create(data: CreateAppointmentData, tx?: PrismaTransactionClient): Promise<Appointment> {
    const appointment: AppointmentWithServices = {
      id: randomUUID(),
      petShopId: data.petShopId,
      petId: data.petId,
      clientId: data.clientId,
      date: new Date(data.date),
      paymentType: data.paymentType || 'MONETARY',
      status: 'PENDING',
      services: [],
    };
    this.items.push(appointment);
    const { services, ...rest } = appointment;
    return rest as Appointment;
  }

  async save(
    appointment: AppointmentWithServices,
    tx?: PrismaTransactionClient,
  ): Promise<Appointment> {
    const index = this.items.findIndex((item) => item.id === appointment.id);
    if (index >= 0) {
      this.items[index] = appointment;
    }
    const { services, ...rest } = appointment;
    return rest as Appointment;
  }

  async findById(id: string): Promise<AppointmentWithServices | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findByClientId(clientId: string): Promise<AppointmentWithServices[]> {
    return this.items.filter((item) => item.clientId === clientId);
  }

  async findManyByPetShopIdOnDate(
    petShopId: string,
    date: Date,
  ): Promise<AppointmentWithServices[]> {
    return this.items.filter(
      (item) => item.petShopId === petShopId && item.date.toDateString() === date.toDateString(),
    );
  }

  async findConflictingAppointment(
    petShopId: string,
    startTime: Date,
    endTime: Date,
    tx?: PrismaTransactionClient,
  ): Promise<AppointmentWithServices | null> {
    return (
      this.items.find(
        (item) => item.petShopId === petShopId && item.date >= startTime && item.date <= endTime,
      ) ?? null
    );
  }
}
