import { hash } from 'bcryptjs';
import { PetShop, PetShopUser, Role } from '@prisma/client';
import { prisma } from '@/infra/database/prisma/client';
import { JwtService } from '@/infra/providers/JwtService';

interface CreatePetShopOptions {
  name?: string;
  email?: string;
  password?: string;
}

export async function createAndAuthenticatePetshop(
  options: CreatePetShopOptions = {},
): Promise<{ token: string; petShop: PetShop; user: PetShopUser }> {
  const petShop = await prisma.petShop.create({
    data: {
      name: options.name ?? 'Test PetShop',
    },
  });

  const user = await prisma.petShopUser.create({
    data: {
      name: 'Test Owner',
      email: options.email ?? `owner_${Date.now()}@test.com`,
      password: await hash(options.password ?? '123456', 6),
      role: Role.OWNER,
      petShopId: petShop.id,
    },
  });

  const jwtService = new JwtService();
  const token = jwtService.sign({
    sub: user.id,
    role: user.role,
    petShopId: petShop.id,
  });

  return { token, petShop, user };
}
