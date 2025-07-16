import { NextRequest } from 'next/server';
import { makeServiceController } from '@/main/factories/controllers/makeServiceController';
const serviceController = makeServiceController();

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return serviceController.update(request, { params });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return serviceController.delete(request, { params });
}
