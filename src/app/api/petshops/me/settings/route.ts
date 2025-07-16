import { makePetShopController } from '@/main/factories/controllers/makePetShopController';
import { NextRequest } from 'next/server';

const petShopController = makePetShopController();

export async function PUT(request: NextRequest) {
  return petShopController.update(request);
}
