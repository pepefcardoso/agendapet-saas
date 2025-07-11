import { IClientUserRepository } from '@/core/domain/repositories/IClientUserRepository';
import { compare } from 'bcryptjs';
import { InvalidCredentialsError } from './errors/InvalidCredentialsError';
import { JwtService, IJwtPayload } from '@/infra/providers/JwtService';

interface IAuthenticateClientUserUseCaseRequest {
  email: string;
  password: string;
}

interface IAuthenticateClientUserUseCaseResponse {
  accessToken: string;
}

export class AuthenticateClientUserUseCase {
  constructor(
    private clientUserRepository: IClientUserRepository,
    private jwtService: JwtService,
  ) {}

  async execute({
    email,
    password,
  }: IAuthenticateClientUserUseCaseRequest): Promise<IAuthenticateClientUserUseCaseResponse> {
    const user = await this.clientUserRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const doesPasswordMatch = await compare(password, user.password);
    if (!doesPasswordMatch) {
      throw new InvalidCredentialsError();
    }

    const payload: IJwtPayload = {
      sub: user.id,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
    };
  }
}
