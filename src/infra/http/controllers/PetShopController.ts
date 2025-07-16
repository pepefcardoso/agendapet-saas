import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GetMyPetShopUseCase } from '@/core/application/use-cases/GetMyPetShopUseCase';
import { UpdatePetShopSettingsUseCase } from '@/core/application/use-cases/UpdatePetShopSettingsUseCase';
import { ListPetShopAgendaUseCase } from '@/core/application/use-cases/ListPetShopAgendaUseCase';
import { ResourceNotFoundError } from '@/core/application/use-cases/errors/ResourceNotFoundError';
import { updatePetShopSettingsBodySchema } from '../dtos/UpdatePetShopSettingsBodyDTO';
import { listAgendaQuerySchema } from '../dtos/ListAgendaQueryDTO';

export class PetShopController {
  constructor(
    private getMyPetShopUseCase: GetMyPetShopUseCase,
    private updatePetShopSettingsUseCase: UpdatePetShopSettingsUseCase,
    private listPetShopAgendaUseCase: ListPetShopAgendaUseCase,
  ) {}

  private getPetShopId(request: NextRequest): string | null {
    return request.headers.get('X-PetShop-ID');
  }

  private handleAuthError() {
    console.error(
      'CRITICAL: PetShop ID not found in request headers. Check middleware configuration.',
    );
    return NextResponse.json(
      { message: 'Internal Server Error: Missing authentication context.' },
      { status: 500 },
    );
  }

  async get(request: NextRequest): Promise<NextResponse> {
    try {
      const petShopId = this.getPetShopId(request);
      if (!petShopId) return this.handleAuthError();

      const { petShop } = await this.getMyPetShopUseCase.execute({ petShopId });

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
      const petShopId = this.getPetShopId(request);
      if (!petShopId) return this.handleAuthError();

      const requestBody = await request.json();
      const data = updatePetShopSettingsBodySchema.parse(requestBody);

      const { petShop } = await this.updatePetShopSettingsUseCase.execute({ petShopId, data });

      return NextResponse.json({ petShop });
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { message: 'Validation error.', issues: z.treeifyError(error) },
          { status: 400 },
        );
      }

      console.error(error);
      return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
    }
  }

  async listAgenda(request: NextRequest): Promise<NextResponse> {
    try {
      const petShopId = this.getPetShopId(request);
      if (!petShopId) return this.handleAuthError();

      const { searchParams } = new URL(request.url);
      const { date } = listAgendaQuerySchema.parse({
        date: searchParams.get('date'),
      });

      const { appointments } = await this.listPetShopAgendaUseCase.execute({ petShopId, date });

      return NextResponse.json({ appointments });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { message: 'Validation error.', issues: z.treeifyError(error) },
          { status: 400 },
        );
      }
      console.error(error);
      return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
    }
  }
}
