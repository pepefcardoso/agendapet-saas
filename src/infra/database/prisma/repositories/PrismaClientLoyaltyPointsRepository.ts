import { IClientLoyaltyPointsRepository } from '@/core/domain/repositories/IClientLoyaltyPointsRepository';
import { ClientLoyaltyPoints, Prisma } from '@prisma/client';
import { prisma } from '../client';

export class PrismaClientLoyaltyPointsRepository implements IClientLoyaltyPointsRepository {
  async findByClientIdAndPetShopId(
    clientId: string,
    petShopId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<ClientLoyaltyPoints | null> {
    const db = tx ?? prisma; // Usa tx se disponível
    return db.clientLoyaltyPoints.findUnique({
      where: { clientId_petShopId: { clientId, petShopId } },
    });
  }

  async credit(
    data: { clientId: string; petShopId: string; points: number },
    tx?: Prisma.TransactionClient,
  ): Promise<ClientLoyaltyPoints> {
    const db = tx ?? prisma; // Usa tx se disponível
    return db.clientLoyaltyPoints.upsert({
      where: {
        clientId_petShopId: {
          clientId: data.clientId,
          petShopId: data.petShopId,
        },
      },
      create: data,
      update: { points: { increment: data.points } },
    });
  }

  async debit(
    data: { clientId: string; petShopId: string; points: number },
    tx: Prisma.TransactionClient,
  ): Promise<ClientLoyaltyPoints> {
    // A operação de débito sempre deve estar em uma transação
    return tx.clientLoyaltyPoints.update({
      where: {
        clientId_petShopId: {
          clientId: data.clientId,
          petShopId: data.petShopId,
        },
      },
      data: { points: { decrement: data.points } },
    });
  }
}
