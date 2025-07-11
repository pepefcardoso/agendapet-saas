import { prisma } from '../client';
import {
  IClientUserRepository,
  CreateClientUserData,
} from '@/core/domain/repositories/IClientUserRepository';
import { ClientUser } from '@prisma/client';

export class PrismaClientUserRepository implements IClientUserRepository {
  async findByEmail(email: string): Promise<ClientUser | null> {
    const user = await prisma.clientUser.findUnique({
      where: {
        email,
      },
    });

    return user;
  }

  async create(data: CreateClientUserData): Promise<ClientUser> {
    const user = await prisma.clientUser.create({
      data,
    });

    return user;
  }
}
