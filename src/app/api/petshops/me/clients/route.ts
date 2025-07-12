import { ClientManagementController } from '@/infra/http/controllers/ClientManagementController';
import { NextRequest } from 'next/server';

const clientManagementController = new ClientManagementController();

export async function POST(request: NextRequest) {
  return clientManagementController.add(request);
}

export async function GET(request: NextRequest) {
  return clientManagementController.list(request);
}
