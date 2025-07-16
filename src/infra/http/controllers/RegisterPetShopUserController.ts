import { RegisterPetShopUserUseCase } from '@/core/application/use-cases/RegisterPetShopUserUseCase';
import { UserAlreadyExistsError } from '@/core/application/use-cases/errors/UserAlreadyExistsError';
import { registerPetShopUserBodySchema } from '@/infra/http/dtos/RegisterPetShopUserDTO';
import { NextResponse } from 'next/server';
import z, { ZodError } from 'zod';

export class RegisterPetShopUserController {
  constructor(private registerPetShopUserUseCase: RegisterPetShopUserUseCase) {}

  async handle(request: Request) {
    try {
      const { name, email, password, petShopName } = registerPetShopUserBodySchema.parse(
        await request.json(),
      );

      const { user } = await this.registerPetShopUserUseCase.execute({
        name,
        email,
        password,
        petShopName,
      });

      return NextResponse.json({ user }, { status: 201 });
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
