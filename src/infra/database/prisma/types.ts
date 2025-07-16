import { Prisma } from '@prisma/client';

/**
 * Representa o client de transação passado no callback de prisma.$transaction.
 * Permite usar todos os métodos de consulta (find, create, update, delete, etc.) dentro de uma transação.
 */
export type PrismaTransactionClient = Prisma.TransactionClient;
