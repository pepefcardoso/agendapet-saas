import { Rating } from '@prisma/client';
import { randomUUID } from 'node:crypto';

export function makeRating(override: Partial<Rating> = {}): Rating {
  return {
    id: randomUUID(),
    score: 5,
    comment: null,
    clientId: randomUUID(),
    petShopId: randomUUID(),
    ...override,
  };
}
