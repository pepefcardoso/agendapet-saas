import { RegisterClientUserUseCase } from '@/core/application/use-cases/RegisterClientUserUseCase';
import { UserAlreadyExistsError } from '@/core/application/use-cases/errors/UserAlreadyExistsError';
import { registerClientUserBodySchema } from '@/infra/http/dtos/RegisterClientUserDTO';
import { NextResponse } from 'next/server';
import z, { ZodError } from 'zod';

export class RegisterClientUserController {
  constructor(private registerClientUserUseCase: RegisterClientUserUseCase) {}

  async handle(request: Request) {
    try {
      const { name, email, password } = registerClientUserBodySchema.parse(await request.json());

      const { user } = await this.registerClientUserUseCase.execute({
        name,
        email,
        password,
      });

      return NextResponse.json({ client: user }, { status: 201 });
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { message: 'Validation failed.', issues: z.treeifyError(error) },
          { status: 400 },
        );
      }

      if (error instanceof UserAlreadyExistsError) {
        return NextResponse.json({ message: error.message }, { status: 409 });
      }

      console.error(error);
      return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
    }
  }
}
