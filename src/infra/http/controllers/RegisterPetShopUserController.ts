import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { registerPetShopUserBodySchema } from '../dtos/RegisterPetShopUserDTO';
import { PrismaPetShopUserRepository } from '@/infra/database/prisma/repositories/PrismaPetShopUserRepository';
import { RegisterPetShopUserUseCase } from '@/core/application/use-cases/RegisterPetShopUserUseCase';
import { UserAlreadyExistsError } from '@/core/application/use-cases/errors/UserAlreadyExistsError';
import { Role } from '@prisma/client';

export class RegisterPetShopUserController {
  async handle(request: NextRequest): Promise<NextResponse> {
    try {
      const requestBody = await request.json();
      const { name, email, password, petShopId, role } =
        registerPetShopUserBodySchema.parse(requestBody);

      const petShopUserRepository = new PrismaPetShopUserRepository();
      const registerUseCase = new RegisterPetShopUserUseCase(petShopUserRepository);

      await registerUseCase.execute({
        name,
        email,
        password,
        petShopId,
        role: role as Role,
      });

      return new NextResponse(null, { status: 201 });
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        return NextResponse.json({ message: error.message }, { status: 409 });
      }

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { message: 'Validation error.', issues: error.format() },
          { status: 400 },
        );
      }

      console.error(error);
      return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
    }
  }
}
