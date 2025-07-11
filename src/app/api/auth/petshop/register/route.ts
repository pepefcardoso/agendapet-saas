import { RegisterPetShopUserController } from '@/infra/http/controllers/RegisterPetShopUserController';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const registerController = new RegisterPetShopUserController();

  return registerController.handle(request);
}
