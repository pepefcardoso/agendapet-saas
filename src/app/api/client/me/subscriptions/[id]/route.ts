import { NextRequest, NextResponse } from 'next/server';
import { ResourceNotFoundError } from '@/core/application/use-cases/errors/ResourceNotFoundError';
import { NotAuthorizedError } from '@/core/application/use-cases/errors/NotAuthorizedError';
import { makeClientSubscriptionController } from '@/main/factories/controllers/makeClientSubscriptionController';

const clientSubscriptionController = makeClientSubscriptionController();

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const clientId = request.headers.get('X-User-ID');
    if (!clientId) {
      return NextResponse.json({ message: 'Client ID is missing.' }, { status: 400 });
    }

    const subscriptionId = params.id;

    const result = await clientSubscriptionController.cancel(subscriptionId, clientId);

    return new NextResponse(null, { status: result.status });
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    if (error instanceof NotAuthorizedError) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
  }
}
