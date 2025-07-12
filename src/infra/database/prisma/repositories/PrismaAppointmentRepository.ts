import { prisma } from '../client';
import {
  IAppointmentRepository,
  CreateAppointmentData,
  AppointmentWithServices,
} from '@/core/domain/repositories/IAppointmentRepository';
import { Appointment } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';

export class PrismaAppointmentRepository implements IAppointmentRepository {
  async create(data: CreateAppointmentData): Promise<Appointment> {
    const { serviceIds, ...appointmentData } = data;

    const appointment = await prisma.appointment.create({
      data: {
        ...appointmentData,
        services: {
          connect: serviceIds.map((serviceId) => ({ id: serviceId })),
        },
      },
    });

    return appointment;
  }

  async findById(id: string): Promise<Appointment | null> {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });
    return appointment;
  }

  async findByClientId(clientId: string): Promise<Appointment[]> {
    const appointments = await prisma.appointment.findMany({
      where: { clientId },
    });
    return appointments;
  }

  async findManyByPetShopIdOnDate(
    petShopId: string,
    date: Date,
  ): Promise<AppointmentWithServices[]> {
    const start = startOfDay(date);
    const end = endOfDay(date);

    const appointments = await prisma.appointment.findMany({
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

    return appointments;
  }
}
