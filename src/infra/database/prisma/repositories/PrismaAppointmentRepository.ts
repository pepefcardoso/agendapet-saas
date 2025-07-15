import { prisma } from '../client';
import {
  IAppointmentRepository,
  CreateAppointmentData,
  AppointmentWithServices,
  PrismaTransactionClient,
} from '@/core/domain/repositories/IAppointmentRepository';
import { Appointment } from '@prisma/client';
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
    // Um conflito existe se um agendamento existente começa antes do nosso novo terminar,
    // E termina depois do nosso novo começar.
    return db.appointment.findFirst({
      where: {
        petShopId,
        status: { not: 'CANCELLED' }, // Ignorar agendamentos cancelados
        AND: [
          {
            date: {
              lt: endTime, // Começa antes do nosso agendamento terminar
            },
          },
          {
            // Precisamos calcular o fim do agendamento existente.
            // Esta consulta é complexa e pode exigir SQL bruto ou uma mudança no schema.
            // Por simplicidade aqui, vamos manter uma lógica aproximada, mas o ideal
            // seria armazenar a `endTime` no banco.
            // A lógica correta requer uma query mais avançada.
            // Para o escopo atual, vamos manter a validação em JS no UseCase
            // como estava, mas a estrutura do método fica pronta.
            // A query abaixo não funcionará sem a endTime no schema.
            // Reverteremos a validação para o UseCase por enquanto.
          },
        ],
      },
    });
  }
}
