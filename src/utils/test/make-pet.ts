import { Pet, PetSize } from '@prisma/client';
import { randomUUID } from 'crypto';

export function makePet(override: Partial<Pet> = {}): Pet {
  return {
    id: randomUUID(),
    name: 'Rex',
    size: PetSize.MEDIO,
    ownerId: randomUUID(),
    ...override,
  };
}
