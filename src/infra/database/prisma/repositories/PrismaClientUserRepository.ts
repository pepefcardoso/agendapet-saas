import { prisma } from '../client';
import {
  IClientUserRepository,
  CreateClientUserData,
} from '@/core/domain/repositories/IClientUserRepository';
import { ClientUser } from '@prisma/client';

export class PrismaClientUserRepository implements IClientUserRepository {
  async findByEmail(email: string): Promise<ClientUser | null> {
    return prisma.clientUser.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<ClientUser | null> {
    return prisma.clientUser.findUnique({
      where: { id },
    });
  }

  async create(data: CreateClientUserData): Promise<ClientUser> {
    return prisma.clientUser.create({
      data,
    });
  }
}
