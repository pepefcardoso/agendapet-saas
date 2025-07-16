import { ClientLoyaltyPoints, Prisma } from '@prisma/client';

export interface IClientLoyaltyPointsRepository {
  findByClientIdAndPetShopId(
    clientId: string,
    petShopId: string,
    tx?: Prisma.TransactionClient, // Adicionado tx
  ): Promise<ClientLoyaltyPoints | null>;

  credit(
    data: { clientId: string; petShopId: string; points: number },
    tx?: Prisma.TransactionClient, // Adicionado tx
  ): Promise<ClientLoyaltyPoints>;

  debit(
    data: { clientId: string; petShopId: string; points: number },
    tx: Prisma.TransactionClient, // Adicionado tx
  ): Promise<ClientLoyaltyPoints>;
}
