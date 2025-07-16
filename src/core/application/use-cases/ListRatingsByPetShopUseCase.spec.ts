import { describe, it, expect, beforeEach } from 'vitest';
import { ListRatingsByPetShopUseCase } from './ListRatingsByPetShopUseCase';
import { InMemoryRatingRepository } from '@/infra/domain/repositories/in-memory/InMemoryRatingRepository';
import { InMemoryPetShopRepository } from '@/core/domain/repositories/in-memory/InMemoryPetShopRepository';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';
import { makePetShop } from '@/utils/test/make-pet-shop';

let ratingsRepository: InMemoryRatingRepository;
let petShopsRepository: InMemoryPetShopRepository;
let sut: ListRatingsByPetShopUseCase;

describe('ListRatingsByPetShopUseCase', () => {
  beforeEach(() => {
    ratingsRepository = new InMemoryRatingRepository();
    petShopsRepository = new InMemoryPetShopRepository();
    sut = new ListRatingsByPetShopUseCase(ratingsRepository, petShopsRepository);
  });

  it('should be able to list ratings for a specific petShop', async () => {
    const petShop = makePetShop();
    await petShopsRepository.create(petShop);

    await ratingsRepository.create(
      makeRating({ petShopId: petShop.id, clientId: 'client-1', score: 5 }),
    );
    await ratingsRepository.create(
      makeRating({ petShopId: petShop.id, clientId: 'client-2', score: 4 }),
    );
    await ratingsRepository.create(
      makeRating({ petShopId: 'other-petshop', clientId: 'client-3', score: 3 }),
    );

    const { ratings, totalCount } = await sut.execute({ petShopId: petShop.id });

    expect(ratings).toHaveLength(2);
    expect(totalCount).toEqual(2);
    expect(ratings[0].petShopId).toEqual(petShop.id);
    expect(ratings[1].petShopId).toEqual(petShop.id);
    expect(ratings[0]).toHaveProperty('client.name'); // Verifica se o nome do cliente está incluído
  });

  it('should return empty array if no ratings found for petShop', async () => {
    const petShop = makePetShop();
    await petShopsRepository.create(petShop);

    const { ratings, totalCount } = await sut.execute({ petShopId: petShop.id });

    expect(ratings).toHaveLength(0);
    expect(totalCount).toEqual(0);
  });

  it('should throw ResourceNotFoundError if petShop does not exist', async () => {
    await expect(sut.execute({ petShopId: 'non-existing-petshop-id' })).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });

  it('should support pagination', async () => {
    const petShop = makePetShop();
    await petShopsRepository.create(petShop);

    // Criar 20 avaliações para o petshop
    for (let i = 1; i <= 20; i++) {
      await ratingsRepository.create(
        makeRating({ petShopId: petShop.id, clientId: `client-${i}`, score: (i % 5) + 1 }),
      );
    }

    const { ratings: page1, totalCount: totalPage1 } = await sut.execute({
      petShopId: petShop.id,
      page: 1,
      limit: 10,
    });
    expect(page1).toHaveLength(10);
    expect(totalPage1).toEqual(20);

    const { ratings: page2, totalCount: totalPage2 } = await sut.execute({
      petShopId: petShop.id,
      page: 2,
      limit: 10,
    });
    expect(page2).toHaveLength(10);
    expect(totalPage2).toEqual(20);

    // Verificar que as avaliações são diferentes entre as páginas
    const allRatings = ratingsRepository.items.filter((item) => item.petShopId === petShop.id);
    const expectedPage1Ids = allRatings.slice(0, 10).map((r) => r.id);
    const receivedPage1Ids = page1.map((r) => r.id);
    expect(receivedPage1Ids).toEqual(expectedPage1Ids);

    const expectedPage2Ids = allRatings.slice(10, 20).map((r) => r.id);
    const receivedPage2Ids = page2.map((r) => r.id);
    expect(receivedPage2Ids).toEqual(expectedPage2Ids);
  });
});
