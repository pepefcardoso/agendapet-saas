import { WorkingHours } from '@/core/domain/types/WorkingHours';

export type UpdatePetShopSettingsDTO = {
  name?: string;
  address?: string;
  phone?: string;
  workingHours?: WorkingHours;
};
