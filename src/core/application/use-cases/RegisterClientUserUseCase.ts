import { IClientUserRepository } from '@/core/domain/repositories/IClientUserRepository';
import { hash } from 'bcryptjs';
import { UserAlreadyExistsError } from './errors/UserAlreadyExistsError';
import { ClientUser } from '@prisma/client';

interface IRegisterClientUserUseCaseRequest {
  name: string;
  email: string;
  password: string;
}

interface IRegisterClientUserUseCaseResponse {
  user: ClientUser;
}

export class RegisterClientUserUseCase {
  constructor(private clientUserRepository: IClientUserRepository) {}

  async execute({
    name,
    email,
    password,
  }: IRegisterClientUserUseCaseRequest): Promise<IRegisterClientUserUseCaseResponse> {
    const userWithSameEmail = await this.clientUserRepository.findByEmail(email);

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError();
    }

    const passwordHash = await hash(password, 8);

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
