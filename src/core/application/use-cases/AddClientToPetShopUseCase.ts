import { IClientUserRepository } from '@/core/domain/repositories/IClientUserRepository';
import { IPetShopClientRepository } from '@/core/domain/repositories/IPetShopClientRepository';
import { ClientAlreadyLinkedError } from './errors/ClientAlreadyLinkedError';
import { hash } from 'bcryptjs';
import { randomUUID } from 'crypto';

interface IAddClientToPetShopUseCaseRequest {
  name: string;
  email: string;
  petShopId: string;
}

export class AddClientToPetShopUseCase {
  constructor(
    private clientUserRepository: IClientUserRepository,
    private petShopClientRepository: IPetShopClientRepository,
  ) {}

  async execute({ name, email, petShopId }: IAddClientToPetShopUseCaseRequest): Promise<void> {
    let client = await this.clientUserRepository.findByEmail(email);

    if (!client) {
      const tempPassword = randomUUID();
      const passwordHash = await hash(tempPassword, 8);

      client = await this.clientUserRepository.create({
        name,
        email,
        password: passwordHash,
      });
    }

    const existingLink = await this.petShopClientRepository.findByPetShopAndClient(
      petShopId,
      client.id,
    );

    if (existingLink) {
      throw new ClientAlreadyLinkedError();
    }

    await this.petShopClientRepository.link(petShopId, client.id);
  }
}
