import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SubscribeToPlanUseCase } from '@/core/application/use-cases/SubscribeToPlanUseCase';
import { CancelClientSubscriptionUseCase } from '@/core/application/use-cases/CancelClientSubscriptionUseCase';
import { ResourceNotFoundError } from '@/core/application/use-cases/errors/ResourceNotFoundError';
import { NotAuthorizedError } from '@/core/application/use-cases/errors/NotAuthorizedError';
import { SubscriptionFailedError } from '@/core/application/use-cases/errors/SubscriptionFailedError';

const subscribeBodySchema = z.object({
  planId: z.uuid(),
});

export class ClientSubscriptionController {
  constructor(
    private subscribeToPlanUseCase: SubscribeToPlanUseCase,
    private cancelClientSubscriptionUseCase: CancelClientSubscriptionUseCase,
  ) {}

  private getClientId(request: NextRequest): string | null {
    return request.headers.get('X-User-ID');
  }

  private handleAuthError() {
    console.error(
      'CRITICAL: Client ID not found in request headers. Check middleware configuration.',
    );
    return NextResponse.json(
      { message: 'Internal Server Error: Missing authentication context.' },
      { status: 500 },
    );
  }

  async subscribe(request: NextRequest): Promise<NextResponse> {
    try {
      const clientId = this.getClientId(request);
      if (!clientId) return this.handleAuthError();

      const body = await request.json();
      const { planId } = subscribeBodySchema.parse(body);

      const result = await this.subscribeToPlanUseCase.execute({
        planId,
        clientId,
      });

      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { message: 'Validation error.', issues: error.flatten().fieldErrors },
          { status: 400 },
        );
      }
      if (error instanceof ResourceNotFoundError) {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
      if (error instanceof SubscriptionFailedError) {
        return NextResponse.json({ message: error.message }, { status: 409 });
      }

      console.error(error);
      return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
    }
  }

  async cancel(
    request: NextRequest,
    { params }: { params: { id: string } },
  ): Promise<NextResponse> {
    try {
      const clientId = this.getClientId(request);
      if (!clientId) return this.handleAuthError();

      const subscriptionId = params.id;

      await this.cancelClientSubscriptionUseCase.execute({
        subscriptionId,
        clientId,
      });

      return new NextResponse(null, { status: 204 });
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
}
