import { NextRequest, NextResponse } from 'next/server';
import z, { ZodError } from 'zod';
import { CreateRatingUseCase } from '@/core/application/use-cases/CreateRatingUseCase';
import { ListRatingsByPetShopUseCase } from '@/core/application/use-cases/ListRatingsByPetShopUseCase';
import { ResourceNotFoundError } from '@/core/application/use-cases/errors/ResourceNotFoundError';
import { NotAllowedError } from '@/core/application/use-cases/errors/NotAllowedError';
import { createRatingBodySchema } from '../dtos/CreateRatingDTO';
import { listRatingsQuerySchema } from '../dtos/ListRatingsQueryDTO';

export class RatingController {
  constructor(
    private createRatingUseCase: CreateRatingUseCase,
    private listRatingsByPetShopUseCase: ListRatingsByPetShopUseCase,
  ) {}

  private getClientId(request: NextRequest): string | null {
    return request.headers.get('X-User-ID');
  }

  private handleAuthError() {
    console.error(
      'CRITICAL: Client ID not found in request headers. Check middleware configuration for this route.',
    );
    return NextResponse.json(
      { message: 'Internal Server Error: Missing authentication context.' },
      { status: 500 },
    );
  }

  async create(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const clientId = this.getClientId(request);
      if (!clientId) return this.handleAuthError();

      const petShopId = params.id;
      const body = await request.json();
      const { score, comment } = createRatingBodySchema.parse(body);

      const { rating } = await this.createRatingUseCase.execute({
        petShopId,
        clientId,
        score,
        comment,
      });

      return NextResponse.json({ rating }, { status: 201 });
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { message: 'Validation error.', issues: z.treeifyError(error) },
          { status: 400 },
        );
      }
      if (error instanceof ResourceNotFoundError) {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
      if (error instanceof NotAllowedError) {
        return NextResponse.json({ message: error.message }, { status: 403 });
      }
      console.error(error);
      return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
    }
  }

  async list(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const petShopId = params.id;
      const { searchParams } = new URL(request.url);
      const query = Object.fromEntries(searchParams.entries());
      const { page, limit } = listRatingsQuerySchema.parse(query);

      const { ratings, totalCount } = await this.listRatingsByPetShopUseCase.execute({
        petShopId,
        page,
        limit,
      });

      return NextResponse.json(
        {
          ratings,
          totalCount,
          page,
          limit,
        },
        { status: 200 },
      );
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { message: 'Validation error.', issues: z.treeifyError(error) },
          { status: 400 },
        );
      }
      if (error instanceof ResourceNotFoundError) {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
      console.error(error);
      return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
    }
  }
}
