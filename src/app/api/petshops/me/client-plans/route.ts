import { makeClientPlanController } from '@/main/factories/controllers/makeClientPlanController';
import { NextRequest } from 'next/server';

const clientPlanController = makeClientPlanController();

export async function POST(request: NextRequest) {
  return clientPlanController.create(request);
}

export async function GET(request: NextRequest) {
  return clientPlanController.list(request);
}
