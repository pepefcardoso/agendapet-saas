import { makeClientManagementController } from '@/main/factories/controllers/makeClientManagementController';
import { NextRequest } from 'next/server';

const clientManagementController = makeClientManagementController();

export async function POST(request: NextRequest) {
  return clientManagementController.add(request);
}

export async function GET(request: NextRequest) {
  return clientManagementController.list(request);
}
