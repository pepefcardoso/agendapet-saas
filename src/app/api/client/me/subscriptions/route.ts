import { NextRequest, NextResponse } from 'next/server';
import { ResourceNotFoundError } from '@/core/application/use-cases/errors/ResourceNotFoundError';
import { SubscriptionFailedError } from '@/core/application/use-cases/errors/SubscriptionFailedError';
import { z } from 'zod';
import { makeClientSubscriptionController } from '@/main/factories/controllers/makeClientSubscriptionController';
import { subscribeToPlanSchema } from '@/infra/http/dtos/SubscribeToPlanDTO';

const clientSubscriptionController = makeClientSubscriptionController();

export async function POST(request: NextRequest) {
  try {
    const clientId = request.headers.get('X-User-ID');
    if (!clientId) {
      return NextResponse.json({ message: 'Client ID is missing.' }, { status: 400 });
    }

    const { planId } = subscribeToPlanSchema.parse(await request.json());

    const result = await clientSubscriptionController.subscribe({ planId, clientId });

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error.', issues: error.format() },
        { status: 400 },
      );
    }
    if (error instanceof ResourceNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    if (error instanceof SubscriptionFailedError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    console.error(error); // Logar o erro interno
    return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
  }
}
