import {
  IRatingRepository,
  RatingWithClientName,
} from '@/core/domain/repositories/IRatingRepository';
import { IPetShopRepository } from '@/core/domain/repositories/IPetShopRepository';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';

interface ListRatingsByPetShopUseCaseRequest {
  petShopId: string;
  page?: number;
  limit?: number;
}

interface ListRatingsByPetShopUseCaseResponse {
  ratings: RatingWithClientName[];
  totalCount: number;
}

export class ListRatingsByPetShopUseCase {
  constructor(
    private ratingsRepository: IRatingRepository,
    private petShopsRepository: IPetShopRepository,
  ) {}

  async execute({
    petShopId,
    page,
    limit,
  }: ListRatingsByPetShopUseCaseRequest): Promise<ListRatingsByPetShopUseCaseResponse> {
    const petShop = await this.petShopsRepository.findById(petShopId);

    if (!petShop) {
      throw new ResourceNotFoundError('PetShop not found.');
    }

    const ratings = await this.ratingsRepository.findManyByPetShopId(petShopId, { page, limit });
    const totalCount = await this.ratingsRepository.countByPetShopId(petShopId);

    return {
      ratings,
      totalCount,
    };
  }
}
