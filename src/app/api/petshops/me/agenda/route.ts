import { makePetShopController } from '@/main/factories/controllers/makePetShopController';
import { NextRequest } from 'next/server';

const petShopController = makePetShopController();

export async function GET(request: NextRequest) {
  return petShopController.listAgenda(request);
}
