import { makeAuthenticateClientUserController } from '@/main/factories/controllers/makeAuthenticateClientUserController';
import { NextRequest } from 'next/server';

const authenticateClientUserController = makeAuthenticateClientUserController();

export async function POST(request: NextRequest) {
  return authenticateClientUserController.handle(request);
}
