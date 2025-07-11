import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateUserBodySchema } from '../dtos/AuthenticateUserDTO';
import { PrismaClientUserRepository } from '@/infra/database/prisma/repositories/PrismaClientUserRepository';
import { AuthenticateClientUserUseCase } from '@/core/application/use-cases/AuthenticateClientUserUseCase';
import { JwtService } from '@/infra/providers/JwtService';
import { InvalidCredentialsError } from '@/core/application/use-cases/errors/InvalidCredentialsError';

export class AuthenticateClientUserController {
  async handle(request: NextRequest): Promise<NextResponse> {
    try {
      const requestBody = await request.json();
      const { email, password } = authenticateUserBodySchema.parse(requestBody);

      // --- Injeção de Dependências Manual ---
      const clientUserRepository = new PrismaClientUserRepository();
      const jwtService = new JwtService();
      const authenticateUseCase = new AuthenticateClientUserUseCase(
        clientUserRepository,
        jwtService,
      );
      // ------------------------------------

      const { accessToken } = await authenticateUseCase.execute({
        email,
        password,
      });

      return NextResponse.json({ accessToken });
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        return NextResponse.json({ message: error.message }, { status: 401 }); // 401 Unauthorized
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
