import { IClientLoyaltyPointsRepository } from '@/core/domain/repositories/IClientLoyaltyPointsRepository';
import { ClientLoyaltyPoints } from '@prisma/client';

export class InMemoryClientLoyaltyPointsRepository implements IClientLoyaltyPointsRepository {
  public items: ClientLoyaltyPoints[] = [];

  async findByClientIdAndPetShopId(
    clientId: string,
    petShopId: string,
  ): Promise<ClientLoyaltyPoints | null> {
    return (
      this.items.find((item) => item.clientId === clientId && item.petShopId === petShopId) ?? null
    );
  }

  async credit(data: {
    clientId: string;
    petShopId: string;
    points: number;
  }): Promise<ClientLoyaltyPoints> {
    const existing = await this.findByClientIdAndPetShopId(data.clientId, data.petShopId);
    if (existing) {
      existing.points += data.points;
      return existing;
    }
    const newPoints = { ...data };
    this.items.push(newPoints);
    return newPoints;
  }

  async debit(data: {
    clientId: string;
    petShopId: string;
    points: number;
  }): Promise<ClientLoyaltyPoints> {
    const existing = await this.findByClientIdAndPetShopId(data.clientId, data.petShopId);
    if (existing) {
      existing.points -= data.points;
      return existing;
    }
    // Debit não deve ser chamado sem um registro existente, mas para segurança do teste:
    const newPoints = { ...data, points: -data.points };
    this.items.push(newPoints);
    return newPoints;
  }
}
