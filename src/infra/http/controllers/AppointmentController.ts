import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CreateAppointmentUseCase } from '@/core/application/use-cases/CreateAppointmentUseCase';
import { ListClientAppointmentsUseCase } from '@/core/application/use-cases/ListClientAppointmentsUseCase';
import { createAppointmentSchema } from '../dtos/CreateAppointmentDTO';
import { ScheduleConflictError } from '@/core/application/use-cases/errors/ScheduleConflictError';
import { AppointmentOutsideWorkingHoursError } from '@/core/application/use-cases/errors/AppointmentOutsideWorkingHoursError';
import { ResourceNotFoundError } from '@/core/application/use-cases/errors/ResourceNotFoundError';
import { CancelAppointmentUseCase } from '@/core/application/use-cases/CancelAppointmentUseCase';
import { GetAppointmentDetailsUseCase } from '@/core/application/use-cases/GetAppointmentDetailsUseCase';
import { NotAuthorizedError } from '@/core/application/use-cases/errors/NotAuthorizedError';

export class AppointmentController {
  constructor(
    private createAppointmentUseCase: CreateAppointmentUseCase,
    private listClientAppointmentsUseCase: ListClientAppointmentsUseCase,
    private getAppointmentDetailsUseCase: GetAppointmentDetailsUseCase,
    private cancelAppointmentUseCase: CancelAppointmentUseCase,
  ) {}

  private getClientId(request: NextRequest): string | null {
    return request.headers.get('X-User-ID');
  }

  private handleAuthError() {
    console.error(
      'CRITICAL: Client ID not found in request headers. Check middleware configuration.',
    );
    return NextResponse.json(
      { message: 'Internal Server Error: Missing authentication context.' },
      { status: 500 },
    );
  }

  async create(request: NextRequest): Promise<NextResponse> {
    try {
      const clientId = request.headers.get('X-User-ID');

      if (!clientId) {
        console.error(
          'CRITICAL: Client ID not found in request headers. Check middleware configuration.',
        );
        return NextResponse.json(
          { message: 'Internal Server Error: Missing authentication context.' },
          { status: 500 },
        );
      }

      const body = await request.json();
      const { petShopId, petId, appointmentDate, services, paymentType, loyaltyPromotionId } =
        createAppointmentSchema.parse(body);

      const { appointment } = await this.createAppointmentUseCase.execute({
        clientId,
        petShopId,
        petId,
        startTime: appointmentDate,
        serviceIds: services,
        paymentType,
        loyaltyPromotionId,
      });

      return NextResponse.json({ appointment }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { message: 'Validation error.', issues: z.treeifyError(error) },
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
        console.error(
          'CRITICAL: Client ID not found in request headers. Check middleware configuration.',
        );
        return NextResponse.json(
          { message: 'Internal Server Error: Missing authentication context.' },
          { status: 500 },
        );
      }

      const { appointments } = await this.listClientAppointmentsUseCase.execute({ clientId });

      return NextResponse.json({ appointments });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
    }
  }

  async getById(
    request: NextRequest,
    { params }: { params: { id: string } },
  ): Promise<NextResponse> {
    try {
      const clientId = this.getClientId(request);
      if (!clientId) return this.handleAuthError();

      const appointmentId = params.id;

      const result = await this.getAppointmentDetailsUseCase.execute({
        appointmentId,
        clientId,
      });

      if (result.isLeft()) {
        const error = result.value;
        switch (error.constructor) {
          case ResourceNotFoundError:
            return NextResponse.json({ message: error.message }, { status: 404 });
          case NotAuthorizedError:
            return NextResponse.json({ message: error.message }, { status: 403 });
          default:
            return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
        }
      }

      return NextResponse.json(result.value);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
    }
  }

  async cancel(
    request: NextRequest,
    { params }: { params: { id: string } },
  ): Promise<NextResponse> {
    try {
      const clientId = this.getClientId(request);
      if (!clientId) return this.handleAuthError();

      const appointmentId = params.id;

      const result = await this.cancelAppointmentUseCase.execute({
        appointmentId,
        clientId,
      });

      if (result.isLeft()) {
        const error = result.value;
        switch (error.constructor) {
          case ResourceNotFoundError:
            return NextResponse.json({ message: error.message }, { status: 404 });
          case NotAuthorizedError:
            return NextResponse.json({ message: error.message }, { status: 403 });
          default:
            return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
        }
      }

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
    }
  }
}
