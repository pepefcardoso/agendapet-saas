import { AuthenticatePetShopUserUseCase } from '@/core/application/use-cases/AuthenticatePetShopUserUseCase';
import { InvalidCredentialsError } from '@/core/application/use-cases/errors/InvalidCredentialsError';
import { authenticateUserBodySchema } from '@/infra/http/dtos/AuthenticateUserDTO';
import { NextResponse } from 'next/server';
import z, { ZodError } from 'zod';

export class AuthenticatePetShopUserController {
  constructor(private authenticateUseCase: AuthenticatePetShopUserUseCase) {}

  async handle(request: Request) {
    try {
      const { email, password } = authenticateUserBodySchema.parse(await request.json());

      const { accessToken } = await this.authenticateUseCase.execute({
        email,
        password,
      });

      return NextResponse.json({ accessToken }, { status: 200 });
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { message: 'Validation failed.', issues: z.treeifyError(error) },
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
