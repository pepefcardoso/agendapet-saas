import { PetController } from '@/infra/http/controllers/PetController';
import { NextRequest } from 'next/server';

const petController = new PetController();

export async function POST(request: NextRequest) {
  return petController.create(request);
}

export async function GET(request: NextRequest) {
  return petController.list(request);
}
