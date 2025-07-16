import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CreateAppointmentUseCase } from '@/core/application/use-cases/CreateAppointmentUseCase';
import { ListClientAppointmentsUseCase } from '@/core/application/use-cases/ListClientAppointmentsUseCase';
import { createAppointmentBodySchema } from '../dtos/CreateAppointmentDTO';
import { ScheduleConflictError } from '@/core/application/use-cases/errors/ScheduleConflictError';
import { AppointmentOutsideWorkingHoursError } from '@/core/application/use-cases/errors/AppointmentOutsideWorkingHoursError';
import { ResourceNotFoundError } from '@/core/application/use-cases/errors/ResourceNotFoundError';

export class AppointmentController {
  constructor(
    private createAppointmentUseCase: CreateAppointmentUseCase,
    private listClientAppointmentsUseCase: ListClientAppointmentsUseCase,
  ) {}

  async create(request: NextRequest): Promise<NextResponse> {
    try {
      const clientId = request.headers.get('X-User-ID');
      if (!clientId) {
        return NextResponse.json({ message: 'Client ID is missing.' }, { status: 400 });
      }

      const body = await request.json();
      const { petShopId, petId, startTime, serviceIds, paymentType, loyaltyPromotionId } =
        createAppointmentBodySchema.parse(body);

      const { appointment } = await this.createAppointmentUseCase.execute({
        clientId,
        petShopId,
        petId,
        startTime,
        serviceIds,
        paymentType,
        loyaltyPromotionId,
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
        return NextResponse.json({ message: error.message }, { status: 409 });
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

      const { appointments } = await this.listClientAppointmentsUseCase.execute({ clientId });

      return NextResponse.json({ appointments });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
    }
  }
}
