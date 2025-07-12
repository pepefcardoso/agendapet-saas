import { PetShopController } from '@/infra/http/controllers/PetShopController';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const petShopController = new PetShopController();
  return petShopController.get(request);
}
