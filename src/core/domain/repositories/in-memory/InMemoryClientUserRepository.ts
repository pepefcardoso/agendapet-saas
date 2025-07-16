import { ClientUser, Prisma } from '@prisma/client';
import {
  IClientUserRepository,
  CreateClientUserData,
} from '@/core/domain/repositories/IClientUserRepository';
import { randomUUID } from 'node:crypto';

export class InMemoryClientUserRepository implements IClientUserRepository {
  public items: ClientUser[] = [];

  async findByEmail(email: string): Promise<ClientUser | null> {
    const user = this.items.find((item) => item.email === email);
    return user || null;
  }

  async findById(id: string): Promise<ClientUser | null> {
    const user = this.items.find((item) => item.id === id);
    return user || null;
  }

  async create(data: CreateClientUserData): Promise<ClientUser> {
    const user: ClientUser = {
      id: randomUUID(),
      name: data.name,
      email: data.email,
      password: data.password, // Em ambiente real, esta senha viria hashada
    };

    this.items.push(user);
    return user;
  }
}
