import { makeClientSubscriptionController } from '@/main/factories/controllers/makeClientSubscriptionController';
import { NextRequest } from 'next/server';

const clientSubscriptionController = makeClientSubscriptionController();

export async function POST(req: NextRequest) {
  return clientSubscriptionController.subscribe(req);
}
