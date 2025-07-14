import { Prisma } from '@prisma/client';

export interface IDatabaseTransaction {
  run<T>(callback: (transaction: Prisma.TransactionClient) => Promise<T>): Promise<T>;
}
