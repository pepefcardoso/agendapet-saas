import { ClientUser, Prisma } from '@prisma/client';

export type CreateClientUserData = Prisma.ClientUserUncheckedCreateInput;

export interface IClientUserRepository {
  findByEmail(email: string): Promise<ClientUser | null>;
  create(data: CreateClientUserData): Promise<ClientUser>;
}
