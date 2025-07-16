import { makeClientPlanController } from '@/main/factories/controllers/makeClientPlanController';
import { NextRequest } from 'next/server';

const clientPlanController = makeClientPlanController();

interface RouteParams {
  params: { id: string };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  return clientPlanController.update(request, { params });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return clientPlanController.delete(request, { params });
}
