import { Service, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

export function makeService(override: Partial<Service> = {}): Service {
  return {
    id: randomUUID(),
    name: 'Banho & Tosa',
    duration: 60,
    price: new Prisma.Decimal(50.0),
    petShopId: randomUUID(),
    ...override,
  };
}
