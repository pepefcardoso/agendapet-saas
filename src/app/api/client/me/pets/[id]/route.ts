import { makePetController } from '@/main/factories/controllers/makePetController';
import { NextRequest } from 'next/server';

const petController = makePetController();

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return petController.update(request, { params });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return petController.delete(request, { params });
}
