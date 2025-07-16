import { Rating } from '@prisma/client';
import { prisma } from '../client';
import {
  IRatingRepository,
  CreateRatingData,
  ListRatingsByPetShopFilters,
  RatingWithClientName,
} from '@/core/domain/repositories/IRatingRepository';

export class PrismaRatingRepository implements IRatingRepository {
  async create(data: CreateRatingData): Promise<Rating> {
    const rating = await prisma.rating.create({
      data,
    });
    return rating;
  }

  async findManyByPetShopId(
    petShopId: string,
    filters?: ListRatingsByPetShopFilters,
  ): Promise<RatingWithClientName[]> {
    const { page = 1, limit = 10 } = filters || {};
    const skip = (page - 1) * limit;

    const ratings = await prisma.rating.findMany({
      where: { petShopId },
      include: {
        client: {
          select: {
            name: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
    return ratings;
  }

  async countByPetShopId(petShopId: string): Promise<number> {
    return prisma.rating.count({
      where: { petShopId },
    });
  }
}
