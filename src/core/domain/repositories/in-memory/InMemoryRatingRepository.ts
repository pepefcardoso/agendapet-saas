import { Rating } from '@prisma/client';
import {
  IRatingRepository,
  CreateRatingData,
  ListRatingsByPetShopFilters,
  RatingWithClientName,
} from '@/core/domain/repositories/IRatingRepository';
import { randomUUID } from 'node:crypto';

interface InMemoryRating extends Rating {
  client: {
    name: string;
  };
}

export class InMemoryRatingRepository implements IRatingRepository {
  public items: InMemoryRating[] = [];

  async create(data: CreateRatingData): Promise<Rating> {
    const rating: InMemoryRating = {
      id: randomUUID(),
      score: data.score,
      comment: data.comment || null,
      clientId: data.clientId,
      petShopId: data.petShopId,
      // No in-memory, precisamos simular o include do client.name
      // Para o propósito de testes, podemos adicionar um mock aqui
      // ou esperar que o cliente seja "incluído" quando necessário nos testes
      // ou ter uma lista de clientes mockadas.
      // Por simplicidade para a implementação do repositório, vamos adicionar um placeholder
      // que seria preenchido em um cenário real de teste mockando o cliente.
      client: {
        name: 'Mock Client Name', // Será sobrescrito nos testes com dados reais
      },
    };

    this.items.push(rating);
    return rating;
  }

  async findManyByPetShopId(
    petShopId: string,
    filters?: ListRatingsByPetShopFilters,
  ): Promise<RatingWithClientName[]> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const skip = (page - 1) * limit;

    const ratings = this.items
      .filter((item) => item.petShopId === petShopId)
      .slice(skip, skip + limit);

    // Simula a inclusão do nome do cliente, se necessário, para testes.
    // Em um cenário real de teste, o mock do repositório de clientes forneceria isso.
    return ratings.map((rating) => ({
      ...rating,
      client: {
        name: `Client ${rating.clientId.substring(0, 4)}`, // Simula um nome de cliente
      },
    }));
  }

  async countByPetShopId(petShopId: string): Promise<number> {
    return this.items.filter((item) => item.petShopId === petShopId).length;
  }
}
