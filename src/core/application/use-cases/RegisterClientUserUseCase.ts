import { IClientUserRepository } from '@/core/domain/repositories/IClientUserRepository';
import { UserAlreadyExistsError } from './errors/UserAlreadyExistsError';
import { ClientUser } from '@prisma/client';
import { IHasher } from '@/infra/providers/IHasher';

interface IRegisterClientUserUseCaseRequest {
  name: string;
  email: string;
  password: string;
}

interface IRegisterClientUserUseCaseResponse {
  user: ClientUser;
}

export class RegisterClientUserUseCase {
  constructor(
    private clientUserRepository: IClientUserRepository,
    private hasher: IHasher,
  ) {}

  async execute({
    name,
    email,
    password,
  }: IRegisterClientUserUseCaseRequest): Promise<IRegisterClientUserUseCaseResponse> {
    const userWithSameEmail = await this.clientUserRepository.findByEmail(email);

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError();
    }

    const passwordHash = await this.hasher.hash(password);

    const user = await this.clientUserRepository.create({
      name,
      email,
      password: passwordHash,
    });

    return {
      user,
    };
  }
}
