import { Pet, Prisma } from '@prisma/client';

export type CreatePetData = Prisma.PetUncheckedCreateInput;
export type UpdatePetData = Prisma.PetUpdateInput;

export interface IPetRepository {
  create(data: CreatePetData): Promise<Pet>;
  findById(id: string): Promise<Pet | null>;
  findByOwnerId(ownerId: string): Promise<Pet[]>;
  update(id: string, data: UpdatePetData): Promise<Pet>;
  delete(id: string): Promise<void>;
}
