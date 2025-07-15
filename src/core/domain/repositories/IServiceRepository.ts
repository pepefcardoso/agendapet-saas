import { Prisma, Service } from '@prisma/client';

export type CreateServiceData = Prisma.ServiceUncheckedCreateInput;
export type UpdateServiceData = Prisma.ServiceUpdateInput;

export interface IServiceRepository {
  create(data: CreateServiceData): Promise<Service>;
  update(id: string, data: UpdateServiceData): Promise<Service | null>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Service | null>;
  findByIds(ids: string[]): Promise<Service[]>;
  findByPetShopId(petShopId: string): Promise<Service[]>;
}
