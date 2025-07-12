import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { registerPetShopUserBodySchema } from '../dtos/RegisterPetShopUserDTO';
import { PrismaPetShopUserRepository } from '@/infra/database/prisma/repositories/PrismaPetShopUserRepository';
import { PrismaPetShopRepository } from '@/infra/database/prisma/repositories/PrismaPetShopRepository';
import { RegisterPetShopUserUseCase } from '@/core/application/use-cases/RegisterPetShopUserUseCase';
import { UserAlreadyExistsError } from '@/core/application/use-cases/errors/UserAlreadyExistsError';

export class RegisterPetShopUserController {
  async handle(request: NextRequest): Promise<NextResponse> {
    try {
      const requestBody = await request.json();
      const { name, email, password, petShopName } =
        registerPetShopUserBodySchema.parse(requestBody);

      const petShopUserRepository = new PrismaPetShopUserRepository();
      const petShopRepository = new PrismaPetShopRepository();
      const registerUseCase = new RegisterPetShopUserUseCase(
        petShopUserRepository,
        petShopRepository,
      );

      await registerUseCase.execute({
        petShopName,
        name,
        email,
        password,
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
