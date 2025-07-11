import { IPetShopUserRepository } from '@/core/domain/repositories/IPetShopUserRepository';
import { compare } from 'bcryptjs';
import { InvalidCredentialsError } from './errors/InvalidCredentialsError';
import { JwtService, IJwtPayload } from '@/infra/providers/JwtService';

interface IAuthenticatePetShopUserUseCaseRequest {
  email: string;
  password: string;
}

interface IAuthenticatePetShopUserUseCaseResponse {
  accessToken: string;
}

export class AuthenticatePetShopUserUseCase {
  constructor(
    private petShopUserRepository: IPetShopUserRepository,
    private jwtService: JwtService,
  ) {}

  async execute({
    email,
    password,
  }: IAuthenticatePetShopUserUseCaseRequest): Promise<IAuthenticatePetShopUserUseCaseResponse> {
    const user = await this.petShopUserRepository.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const doesPasswordMatch = await compare(password, user.password);

    if (!doesPasswordMatch) {
      throw new InvalidCredentialsError();
    }

    const payload: IJwtPayload = {
      sub: user.id,
      role: user.role,
      petShopId: user.petShopId,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
    };
  }
}
