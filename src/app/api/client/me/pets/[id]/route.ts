import { PetController } from '@/infra/http/controllers/PetController';
import { NextRequest } from 'next/server';

const petController = new PetController();

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return petController.update(request, { params });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return petController.delete(request, { params });
}
