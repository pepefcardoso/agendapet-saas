import { ServiceController } from '@/infra/http/controllers/ServiceController';
import { NextRequest } from 'next/server';

const serviceController = new ServiceController();

export async function POST(request: NextRequest) {
  return serviceController.create(request);
}

export async function GET(request: NextRequest) {
  return serviceController.list(request);
}
