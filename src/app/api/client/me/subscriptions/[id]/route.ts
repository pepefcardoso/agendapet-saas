import { NextRequest, NextResponse } from 'next/server';
import { ClientSubscriptionController } from '@/infra/http/controllers/ClientSubscriptionController';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const clientId = request.headers.get('X-User-ID');

  if (!clientId) {
    return NextResponse.json({ message: 'User ID not found in token' }, { status: 401 });
  }

  const subscriptionId = params.id;

  if (!subscriptionId) {
    return NextResponse.json({ message: 'Subscription ID is required' }, { status: 400 });
  }

  const controller = new ClientSubscriptionController();
  const response = await controller.cancel(subscriptionId, clientId);

  return NextResponse.json(response.data, { status: response.status });
}
