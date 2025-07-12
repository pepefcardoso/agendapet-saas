import { ServiceController } from '@/infra/http/controllers/ServiceController';
import { NextRequest } from 'next/server';

const serviceController = new ServiceController();

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return serviceController.update(request, { params });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return serviceController.delete(request, { params });
}
