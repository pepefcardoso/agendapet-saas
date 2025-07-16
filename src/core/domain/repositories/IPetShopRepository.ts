import { PetShop, Prisma } from '@prisma/client';
import { WorkingHours } from '../types/WorkingHours';

export type CreatePetShopData = Prisma.PetShopCreateInput;

export type UpdatePetShopData = Omit<Prisma.PetShopUpdateInput, 'workingHours'> & {
  workingHours?: WorkingHours | typeof Prisma.JsonNull | typeof Prisma.DbNull;
};

export interface IPetShopRepository {
  create(data: CreatePetShopData): Promise<PetShop>;
  findById(id: string): Promise<PetShop | null>;
  update(id: string, data: UpdatePetShopData): Promise<PetShop>;
  delete(id: string): Promise<void>;
}
