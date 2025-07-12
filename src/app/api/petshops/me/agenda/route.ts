import { PetShopController } from '@/infra/http/controllers/PetShopController';
import { NextRequest } from 'next/server';

const petShopController = new PetShopController();

export async function GET(request: NextRequest) {
  return petShopController.listAgenda(request);
}
