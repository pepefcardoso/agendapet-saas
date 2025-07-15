import { prisma } from '@/infra/database/prisma/client';
import { JwtService } from '@/infra/providers/JwtService';
import { PetShop, PetShopUser, Role } from '@prisma/client';

interface CreateAndAuthenticateOptions {
  name?: string;
  email?: string;
  role?: Role;
}

interface AuthOutput {
  token: string;
  user: PetShopUser;
  petShop: PetShop;
}

export async function createAndAuthenticatePetShopUser(
  options: CreateAndAuthenticateOptions = {},
): Promise<AuthOutput> {
  const userEmail = options.email || `owner-${Date.now()}@example.com`;

  const petShop = await prisma.petShop.create({
    data: {
      name: options.name || 'Test PetShop',
    },
  });

  const user = await prisma.petShopUser.create({
    data: {
      name: options.name || 'Test Owner',
      email: userEmail,
      password: 'password_hash_placeholder',
      role: options.role || Role.OWNER,
      petShopId: petShop.id,
    },
  });

  const jwtService = new JwtService();
  const token = jwtService.sign({
    sub: user.id,
    role: user.role,
    petShopId: user.petShopId,
  });

  return { token, user, petShop };
}
