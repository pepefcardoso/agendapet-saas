import { makeAppointmentController } from '@/main/factories/controllers/makeAppointmentController';
import { NextRequest } from 'next/server';

const appointmentController = makeAppointmentController();

export async function POST(request: NextRequest) {
  return appointmentController.create(request);
}

export async function GET(request: NextRequest) {
  return appointmentController.list(request);
}
