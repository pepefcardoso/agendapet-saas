import { NextRequest, NextResponse } from 'next/server';
import { makeAppointmentController } from '@/main/factories/controllers/makeAppointmentController';

const appointmentController = makeAppointmentController();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  return appointmentController.getById(req, { params });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  return appointmentController.cancel(req, { params });
}
