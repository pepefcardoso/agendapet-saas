import { hash } from 'bcryptjs';
import { PetShopUser, Role } from '@prisma/client';
import { IPetShopUserRepository } from '@/core/domain/repositories/IPetShopUserRepository';
import { IPetShopRepository } from '@/core/domain/repositories/IPetShopRepository';
import { UserAlreadyExistsError } from './errors/UserAlreadyExistsError';

interface IRegisterPetShopUserUseCaseRequest {
  petShopName: string;
  name: string;
  email: string;
  password: string;
}

interface IRegisterPetShopUserUseCaseResponse {
  user: PetShopUser;
}

export class RegisterPetShopUserUseCase {
  constructor(
    private petShopUserRepository: IPetShopUserRepository,
    private petShopRepository: IPetShopRepository,
  ) {}

  async execute({
    petShopName,
    name,
    email,
    password,
  }: IRegisterPetShopUserUseCaseRequest): Promise<IRegisterPetShopUserUseCaseResponse> {
    const userWithSameEmail = await this.petShopUserRepository.findByEmail(email);

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError();
    }

    const petShop = await this.petShopRepository.create({
      name: petShopName,
    });

    const passwordHash = await hash(password, 8);

    const user = await this.petShopUserRepository.create({
      name,
      email,
      password: passwordHash,
      role: Role.OWNER,
      petShopId: petShop.id,
    });

    return {
      user,
    };
  }
}
