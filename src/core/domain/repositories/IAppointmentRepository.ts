import { Appointment, Prisma, Service } from '@prisma/client';

export type CreateAppointmentData = Omit<
  Prisma.AppointmentUncheckedCreateInput,
  'id' | 'status'
> & {
  serviceIds: string[];
};

export type AppointmentWithServices = Appointment & {
  services: Service[];
};

export type PrismaTransactionClient = Prisma.TransactionClient;

export interface IAppointmentRepository {
  create(data: CreateAppointmentData, tx?: PrismaTransactionClient): Promise<Appointment>;
  save(appointment: Appointment, tx?: PrismaTransactionClient): Promise<Appointment>;
  findById(id: string): Promise<Appointment | null>;
  findByClientId(clientId: string): Promise<Appointment[]>;
  findManyByPetShopIdOnDate(petShopId: string, date: Date): Promise<AppointmentWithServices[]>;
  findConflictingAppointment(
    petShopId: string,
    startTime: Date,
    endTime: Date,
    tx?: PrismaTransactionClient,
  ): Promise<Appointment | null>;
}
