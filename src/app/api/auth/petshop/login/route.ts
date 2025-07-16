import { makeAuthenticatePetShopUserController } from '@/main/factories/controllers/makeAuthenticatePetShopUserController';
import { NextRequest } from 'next/server';

const authenticatePetShopUserController = makeAuthenticatePetShopUserController();

export async function POST(request: NextRequest) {
  return authenticatePetShopUserController.handle(request);
}
