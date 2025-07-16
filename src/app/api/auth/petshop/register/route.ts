import { makeRegisterPetShopUserController } from '@/main/factories/controllers/makeRegisterPetShopUserController';
import { NextRequest } from 'next/server';

const registerPetShopUserController = makeRegisterPetShopUserController();

export async function POST(request: NextRequest) {
  return registerPetShopUserController.handle(request);
}