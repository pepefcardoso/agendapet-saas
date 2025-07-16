import { prisma } from '../client';
import {
  IRatingRepository,
  CreateRatingData,
  ListRatingsByPetShopFilters,
  RatingWithClientName,
} from '@/core/domain/repositories/IRatingRepository';
import { Rating } from '@prisma/client';

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
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const skip = (page - 1) * limit;

    const ratings = await prisma.rating.findMany({
      where: {
        petShopId,
      },
      include: {
        client: {
          select: {
            name: true, // Inclui apenas o nome do cliente
          },
        },
      },
      orderBy: {
        // Ordena as avaliações da mais recente para a mais antiga
        // Ou por score, dependendo da necessidade do frontend
        // Por enquanto, vamos ordenar por data de criação (se tivéssemos createdAt)
        // Como não temos um campo 'createdAt', vamos assumir uma ordem simples,
        // ou podemos adicionar um campo 'createdAt' no schema.
        // Para este momento, não haverá ordenação explícita do Prisma.
        score: 'desc', // Exemplo de ordenação padrão
      },
      skip,
      take: limit,
    });

    return ratings;
  }

  async countByPetShopId(petShopId: string): Promise<number> {
    return prisma.rating.count({
      where: {
        petShopId,
      },
    });
  }
}
