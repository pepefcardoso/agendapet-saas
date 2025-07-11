import { AuthenticateClientUserController } from '@/infra/http/controllers/AuthenticateClientUserController';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const authenticateController = new AuthenticateClientUserController();
  return authenticateController.handle(request);
}
