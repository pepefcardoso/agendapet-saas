import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { PrismaRatingRepository } from '@/infra/database/prisma/repositories/PrismaRatingRepository';
import { PrismaPetShopRepository } from '@/infra/database/prisma/repositories/PrismaPetShopRepository';
import { PrismaClientUserRepository } from '@/infra/database/prisma/repositories/PrismaClientUserRepository';
import { PrismaAppointmentRepository } from '@/infra/database/prisma/repositories/PrismaAppointmentRepository';
import { CreateRatingUseCase } from '@/core/application/use-cases/CreateRatingUseCase';
import { ListRatingsByPetShopUseCase } from '@/core/application/use-cases/ListRatingsByPetShopUseCase';
import { ResourceNotFoundError } from '@/core/application/use-cases/errors/ResourceNotFoundError';
import { NotAllowedError } from '@/core/application/use-cases/errors/NotAllowedError';
import { createRatingBodySchema } from '../dtos/CreateRatingDTO';
import { listRatingsQuerySchema } from '../dtos/ListRatingsQueryDTO';

export class RatingController {
  async create(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const petShopId = params.id;
      const clientId = request.headers.get('X-User-ID');

      if (!clientId) {
        return NextResponse.json({ message: 'Client ID is missing in headers.' }, { status: 401 });
      }

      const body = await request.json();
      const { score, comment } = createRatingBodySchema.parse(body);

      const ratingsRepository = new PrismaRatingRepository();
      const petShopsRepository = new PrismaPetShopRepository();
      const clientUsersRepository = new PrismaClientUserRepository();
      const appointmentsRepository = new PrismaAppointmentRepository();

      const createRatingUseCase = new CreateRatingUseCase(
        ratingsRepository,
        petShopsRepository,
        clientUsersRepository,
        appointmentsRepository,
      );

      const { rating } = await createRatingUseCase.execute({
        petShopId,
        clientId,
        score,
        comment,
      });

      return NextResponse.json({ rating }, { status: 201 });
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { message: 'Validation error.', errors: error.flatten().fieldErrors },
          { status: 400 },
        );
      }

      if (error instanceof ResourceNotFoundError) {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }

      if (error instanceof NotAllowedError) {
        return NextResponse.json({ message: error.message }, { status: 403 });
      }

      console.error(error); // Log do erro para depuração
      return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
    }
  }

  async list(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const petShopId = params.id;

      const { searchParams } = new URL(request.url);
      const query = Object.fromEntries(searchParams.entries());

      const { page, limit } = listRatingsQuerySchema.parse(query);

      const ratingsRepository = new PrismaRatingRepository();
      const petShopsRepository = new PrismaPetShopRepository();

      const listRatingsByPetShopUseCase = new ListRatingsByPetShopUseCase(
        ratingsRepository,
        petShopsRepository,
      );

      const { ratings, totalCount } = await listRatingsByPetShopUseCase.execute({
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
          { message: 'Validation error.', errors: error.flatten().fieldErrors },
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
