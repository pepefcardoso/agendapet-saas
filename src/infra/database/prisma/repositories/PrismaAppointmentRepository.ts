import { prisma } from '../client';
import {
  IAppointmentRepository,
  CreateAppointmentData,
  AppointmentWithServices,
} from '@/core/domain/repositories/IAppointmentRepository';
import { PrismaTransactionClient } from '@/infra/database/prisma/types';
import { Appointment, AppointmentStatus } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';

export class PrismaAppointmentRepository implements IAppointmentRepository {
  async create(data: CreateAppointmentData, tx?: PrismaTransactionClient): Promise<Appointment> {
    const db = tx || prisma;
    const { serviceIds, ...appointmentData } = data;

    const appointment = await db.appointment.create({
      data: {
        ...appointmentData,
        services: {
          connect: serviceIds.map((serviceId) => ({ id: serviceId })),
        },
      },
    });

    return appointment;
  }

  async save(appointment: Appointment, tx?: PrismaTransactionClient): Promise<Appointment> {
    const db = tx || prisma;
    return db.appointment.update({
      where: { id: appointment.id },
      data: appointment,
    });
  }

  async findById(id: string): Promise<Appointment | null> {
    return prisma.appointment.findUnique({
      where: { id },
    });
  }

  async findByClientId(clientId: string): Promise<Appointment[]> {
    return prisma.appointment.findMany({
      where: { clientId },
    });
  }

  async findManyByPetShopIdOnDate(
    petShopId: string,
    date: Date,
  ): Promise<AppointmentWithServices[]> {
    const start = startOfDay(date);
    const end = endOfDay(date);

    return prisma.appointment.findMany({
      where: {
        petShopId,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        services: true,
      },
    });
  }

  async findConflictingAppointment(
    petShopId: string,
    startTime: Date,
    endTime: Date,
    tx?: PrismaTransactionClient,
  ): Promise<Appointment | null> {
    const db = tx || prisma;
    // Lógica para encontrar agendamentos que se sobrepõem:
    // Um agendamento existente entra em conflito se:
    // (Início existente < Fim do novo agendamento) E (Fim existente > Início do novo agendamento)
    return db.appointment.findFirst({
      where: {
        petShopId,
        status: { not: 'CANCELLED' }, // Exclui agendamentos cancelados
        AND: [
          {
            date: { lt: endTime }, // Início do agendamento existente é antes do fim do novo
          },
          {
            endTime: { gt: startTime }, // Fim do agendamento existente é depois do início do novo
          },
        ],
      },
    });
  }

  async hasCompletedAppointmentByClientAndPetShop(
    clientId: string,
    petShopId: string,
  ): Promise<boolean> {
    const appointment = await prisma.appointment.findFirst({
      where: {
        clientId,
        petShopId,
        status: AppointmentStatus.COMPLETED,
      },
    });
    return !!appointment;
  }
}
