import { PetShopUser, Prisma } from '@prisma/client';

export type CreatePetShopUserData = Prisma.PetShopUserUncheckedCreateInput

export interface IPetShopUserRepository {
  findByEmail(email: string): Promise<PetShopUser | null>;
  create(data: CreatePetShopUserData): Promise<PetShopUser>;
}
