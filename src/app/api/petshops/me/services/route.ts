import { NextRequest } from 'next/server';
import { makeServiceController } from '@/main/factories/controllers/makeServiceController';

const serviceController = makeServiceController();

export async function POST(request: NextRequest) {
  return serviceController.create(request);
}

export async function GET(request: NextRequest) {
  return serviceController.list(request);
}
