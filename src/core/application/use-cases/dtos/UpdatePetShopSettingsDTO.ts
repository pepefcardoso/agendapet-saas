import { Prisma } from '@prisma/client';

export type UpdatePetShopSettingsData = {
  name?: string;
  address?: string | null;
  phone?: string | null;
  workingHours?: Prisma.InputJsonValue;
};

export interface IUpdatePetShopSettingsUseCaseRequest {
  petShopId: string;
  data: UpdatePetShopSettingsData;
}
