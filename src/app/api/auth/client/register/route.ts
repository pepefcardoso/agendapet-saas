import { makeRegisterClientUserController } from '@/main/factories/controllers/makeRegisterClientUserController';
import { NextRequest } from 'next/server';

const registerClientUserController = makeRegisterClientUserController();

export async function POST(request: NextRequest) {
  return registerClientUserController.handle(request);
}
