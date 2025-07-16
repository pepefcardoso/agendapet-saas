import { makePetController } from '@/main/factories/controllers/makePetController';
import { NextRequest } from 'next/server';

const petController = makePetController();

export async function POST(request: NextRequest) {
  return petController.create(request);
}

export async function GET(request: NextRequest) {
  return petController.list(request);
}
