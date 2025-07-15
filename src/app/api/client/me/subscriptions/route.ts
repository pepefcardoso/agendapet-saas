import { NextRequest, NextResponse } from 'next/server';
import { ClientSubscriptionController } from '@/infra/http/controllers/ClientSubscriptionController';
import { subscribeToPlanSchema } from '@/infra/http/dtos/SubscribeToPlanDTO';

export async function POST(request: NextRequest) {
  const clientId = request.headers.get('X-User-ID');

  if (!clientId) {
    return NextResponse.json({ message: 'User ID not found in token' }, { status: 401 });
  }

  const body = await request.json();
  const result = subscribeToPlanSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { message: 'Invalid request body', errors: result.error.flatten() },
      { status: 400 },
    );
  }

  const { planId } = result.data;

  const controller = new ClientSubscriptionController();
  const response = await controller.subscribe({ planId, clientId });

  return NextResponse.json(response.data, { status: response.status });
}
