import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { PrismaPetShopRepository } from '@/infra/database/prisma/repositories/PrismaPetShopRepository';
import { GetMyPetShopUseCase } from '@/core/application/use-cases/GetMyPetShopUseCase';
import { UpdatePetShopSettingsUseCase } from '@/core/application/use-cases/UpdatePetShopSettingsUseCase';
import { ResourceNotFoundError } from '@/core/application/use-cases/errors/ResourceNotFoundError';
import { updatePetShopSettingsBodySchema } from '../dtos/UpdatePetShopSettingsBodyDTO';

export class PetShopController {
  async get(request: NextRequest): Promise<NextResponse> {
    try {
      const petShopId = request.headers.get('X-PetShop-ID');

      if (!petShopId) {
        return NextResponse.json({ message: 'PetShop ID not found in token.' }, { status: 401 });
      }

      const petShopRepository = new PrismaPetShopRepository();
      const getMyPetShopUseCase = new GetMyPetShopUseCase(petShopRepository);

      const { petShop } = await getMyPetShopUseCase.execute({ petShopId });

      return NextResponse.json({ petShop });
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }

      console.error(error);
      return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
    }
  }

  async update(request: NextRequest): Promise<NextResponse> {
    try {
      const petShopId = request.headers.get('X-PetShop-ID');

      if (!petShopId) {
        return NextResponse.json({ message: 'PetShop ID not found in token.' }, { status: 401 });
      }

      const requestBody = await request.json();
      const data = updatePetShopSettingsBodySchema.parse(requestBody);

      const petShopRepository = new PrismaPetShopRepository();
      const updatePetShopUseCase = new UpdatePetShopSettingsUseCase(petShopRepository);

      const { petShop } = await updatePetShopUseCase.execute({ petShopId, data });

      return NextResponse.json({ petShop });
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        return NextResponse.json({ message: error.message }, { status: 404 });
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
