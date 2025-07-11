import { AuthenticatePetShopUserController } from '@/infra/http/controllers/AuthenticatePetShopUserController';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const authenticateController = new AuthenticatePetShopUserController();
  return authenticateController.handle(request);
}
