import { AuthenticateClientUserUseCase } from '@/core/application/use-cases/AuthenticateClientUserUseCase';
import { InvalidCredentialsError } from '@/core/application/use-cases/errors/InvalidCredentialsError';
import { authenticateUserBodySchema } from '@/infra/http/dtos/AuthenticateUserDTO';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class AuthenticateClientUserController {
  constructor(private authenticateUseCase: AuthenticateClientUserUseCase) {}

  async handle(request: Request) {
    try {
      const requestBody = await request.json();
      const { email, password } = authenticateUserBodySchema.parse(requestBody);

      const { accessToken } = await this.authenticateUseCase.execute({
        email,
        password,
      });

      return NextResponse.json({ accessToken }, { status: 200 });
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { message: 'Validation failed.', issues: error.format() },
          { status: 400 },
        );
      }

      if (error instanceof InvalidCredentialsError) {
        return NextResponse.json({ message: error.message }, { status: 401 });
      }

      console.error(error);
      return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
    }
  }
}
