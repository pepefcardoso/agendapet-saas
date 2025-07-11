import { IPetShopUserRepository } from '@/core/domain/repositories/IPetShopUserRepository';
import { hash } from 'bcryptjs';
import { UserAlreadyExistsError } from './errors/UserAlreadyExistsError';
import { PetShopUser, Role } from '@prisma/client';

interface IRegisterPetShopUserUseCaseRequest {
  name: string;
  email: string;
  password: string;
  petShopId: string;
  role: Role;
}

interface IRegisterPetShopUserUseCaseResponse {
  user: PetShopUser;
}

export class RegisterPetShopUserUseCase {
  constructor(private petShopUserRepository: IPetShopUserRepository) {}

  async execute({
    name,
    email,
    password,
    petShopId,
    role,
  }: IRegisterPetShopUserUseCaseRequest): Promise<IRegisterPetShopUserUseCaseResponse> {
    const userWithSameEmail = await this.petShopUserRepository.findByEmail(email);

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError();
    }

    const passwordHash = await hash(password, 8);

    const user = await this.petShopUserRepository.create({
      name,
      email,
      password: passwordHash,
      petShopId,
      role,
    });

    return {
      user,
    };
  }
}
