import { PetShop } from '@prisma/client';
import { randomUUID } from 'crypto';

export function makePetShop(override: Partial<PetShop> = {}): PetShop {
  return {
    id: randomUUID(),
    name: 'Happy Pet',
    address: '123 Main St',
    phone: '555-1234',
    workingHours: {},
    activeSubscriptionId: null,
    ...override,
  };
}
