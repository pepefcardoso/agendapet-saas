import { Appointment, Prisma, Service } from '@prisma/client';

export type CreateAppointmentData = Prisma.AppointmentUncheckedCreateInput & {
  serviceIds: string[];
};

export type AppointmentWithServices = Appointment & {
  services: Service[];
};

export interface IAppointmentRepository {
  create(data: CreateAppointmentData): Promise<Appointment>;
  findById(id: string): Promise<Appointment | null>;
  findByClientId(clientId: string): Promise<Appointment[]>;
  findManyByPetShopIdOnDate(petShopId: string, date: Date): Promise<AppointmentWithServices[]>;
}
