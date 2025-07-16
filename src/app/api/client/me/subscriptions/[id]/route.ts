import { NextRequest } from 'next/server';
import { makeClientSubscriptionController } from '@/main/factories/controllers/makeClientSubscriptionController';

const clientSubscriptionController = makeClientSubscriptionController();

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return clientSubscriptionController.cancel(req, { params });
}
