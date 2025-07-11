import { RegisterClientUserController } from '@/infra/http/controllers/RegisterClientUserController';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const registerController = new RegisterClientUserController();
  return registerController.handle(request);
}
