import { Rating, Prisma } from '@prisma/client';

export type CreateRatingData = Prisma.RatingUncheckedCreateInput;

export interface ListRatingsByPetShopFilters {
  page?: number;
  limit?: number;
}

export type RatingWithClientName = Rating & {
  client: {
    name: string;
  };
};

export interface IRatingRepository {
  create(data: CreateRatingData): Promise<Rating>;
  findManyByPetShopId(
    petShopId: string,
    filters?: ListRatingsByPetShopFilters,
  ): Promise<RatingWithClientName[]>;
  countByPetShopId(petShopId: string): Promise<number>;
}
