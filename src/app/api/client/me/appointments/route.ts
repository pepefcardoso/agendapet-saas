import { AppointmentController } from '@/infra/http/controllers/AppointmentController';
import { NextRequest } from 'next/server';

const appointmentController = new AppointmentController();

export async function POST(request: NextRequest) {
  return appointmentController.create(request);
}

export async function GET(request: NextRequest) {
  return appointmentController.list(request);
}
