import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { registerClientUserBodySchema } from '../dtos/RegisterClientUserDTO';
import { PrismaClientUserRepository } from '@/infra/database/prisma/repositories/PrismaClientUserRepository';
import { RegisterClientUserUseCase } from '@/core/application/use-cases/RegisterClientUserUseCase';
import { UserAlreadyExistsError } from '@/core/application/use-cases/errors/UserAlreadyExistsError';

export class RegisterClientUserController {
  async handle(request: NextRequest): Promise<NextResponse> {
    try {
      const requestBody = await request.json();
      const { name, email, password } = registerClientUserBodySchema.parse(requestBody);

      const clientUserRepository = new PrismaClientUserRepository();
      const registerUseCase = new RegisterClientUserUseCase(clientUserRepository);

      await registerUseCase.execute({
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
