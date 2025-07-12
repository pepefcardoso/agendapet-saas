import { PetShop, Prisma } from '@prisma/client';

export type CreatePetShopData = Prisma.PetShopCreateInput;
export type UpdatePetShopData = Prisma.PetShopUpdateInput;

export interface IPetShopRepository {
  create(data: CreatePetShopData): Promise<PetShop>;
  findById(id: string): Promise<PetShop | null>;
  update(id: string, data: UpdatePetShopData): Promise<PetShop>;
}
