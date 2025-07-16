// src/core/application/providers/Hasher.ts

/**
 * Interface para serviços de hashing de senhas.
 * Garante que qualquer implementacao de hasher tenha os metodos 'hash' e 'compare'.
 */
export interface IHasher {
  hash(payload: string): Promise<string>;
  compare(payload: string, hashed: string): Promise<boolean>;
}
