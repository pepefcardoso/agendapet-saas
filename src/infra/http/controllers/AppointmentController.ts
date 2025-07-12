import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { PrismaAppointmentRepository } from '@/infra/database/prisma/repositories/PrismaAppointmentRepository';
import { PrismaPetShopRepository } from '@/infra/database/prisma/repositories/PrismaPetShopRepository';
import { PrismaServiceRepository } from '@/infra/database/prisma/repositories/PrismaServiceRepository';

import { CreateAppointmentUseCase } from '@/core/application/use-cases/CreateAppointmentUseCase';
import { ListClientAppointmentsUseCase } from '@/core/application/use-cases/ListClientAppointmentsUseCase';

import { createAppointmentBodySchema } from '../dtos/CreateAppointmentDTO';
import { ScheduleConflictError } from '@/core/application/use-cases/errors/ScheduleConflictError';
import { AppointmentOutsideWorkingHoursError } from '@/core/application/use-cases/errors/AppointmentOutsideWorkingHoursError';
import { ResourceNotFoundError } from '@/core/application/use-cases/errors/ResourceNotFoundError';

export class AppointmentController {
  private appointmentRepository = new PrismaAppointmentRepository();
  private petShopRepository = new PrismaPetShopRepository();
  private serviceRepository = new PrismaServiceRepository();

  async create(request: NextRequest): Promise<NextResponse> {
    try {
      const clientId = request.headers.get('X-User-ID');
      if (!clientId) {
        return NextResponse.json({ message: 'Client ID is missing.' }, { status: 400 });
      }

      const requestBody = await request.json();
      const { petShopId, petId, startTime, serviceIds } =
        createAppointmentBodySchema.parse(requestBody);

      const createAppointmentUseCase = new CreateAppointmentUseCase(
        this.appointmentRepository,
        this.petShopRepository,
        this.serviceRepository,
      );

      const { appointment } = await createAppointmentUseCase.execute({
        clientId,
        petShopId,
        petId,
        startTime,
        serviceIds,
      });

      return NextResponse.json({ appointment }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { message: 'Validation error.', issues: error.format() },
          { status: 400 },
        );
      }
      if (
        error instanceof ScheduleConflictError ||
        error instanceof AppointmentOutsideWorkingHoursError
      ) {
        return NextResponse.json({ message: error.message }, { status: 409 }); // 409 Conflict
      }
      if (error instanceof ResourceNotFoundError) {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }

      console.error(error);
      return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
    }
  }

  async list(request: NextRequest): Promise<NextResponse> {
    try {
      const clientId = request.headers.get('X-User-ID');
      if (!clientId) {
        return NextResponse.json({ message: 'Client ID is missing.' }, { status: 400 });
      }

      const listClientAppointmentsUseCase = new ListClientAppointmentsUseCase(
        this.appointmentRepository,
      );

      const { appointments } = await listClientAppointmentsUseCase.execute({ clientId });

      return NextResponse.json({ appointments });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
    }
  }
}
