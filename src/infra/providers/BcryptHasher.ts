// src/infra/providers/BcryptHasher.ts
import { hash, compare } from 'bcryptjs';
import { IHasher } from './IHasher';

export class BcryptHasher implements IHasher {
  async hash(payload: string): Promise<string> {
    return hash(payload, 8);
  }

  async compare(payload: string, hashed: string): Promise<boolean> {
    return compare(payload, hashed);
  }
}
