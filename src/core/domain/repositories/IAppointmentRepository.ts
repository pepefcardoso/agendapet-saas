import { Appointment, Prisma, Service } from '@prisma/client';
import { PrismaTransactionClient } from '@/infra/database/prisma/types';

export type CreateAppointmentData = Omit<
  Prisma.AppointmentUncheckedCreateInput,
  'id' | 'status' | 'endTime'
> & {
  serviceIds: string[];
  endTime: Date;
};

export type AppointmentWithServices = Appointment & {
  services: Service[];
};

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
  hasCompletedAppointmentByClientAndPetShop(clientId: string, petShopId: string): Promise<boolean>;
}
