import { ClientUser } from '@prisma/client';
import { randomUUID } from 'node:crypto';

export function makeClientUser(override: Partial<ClientUser> = {}): ClientUser {
  return {
    id: randomUUID(),
    name: 'John Doe',
    email: `john.doe.${randomUUID().substring(0, 4)}@example.com`,
    password: 'hashed-password-123',
    ...override,
  };
}
