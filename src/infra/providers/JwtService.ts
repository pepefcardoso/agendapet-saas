import { Role } from '@prisma/client';
import { sign, verify } from 'jsonwebtoken';

export interface IJwtPayload {
  sub: string;
  role?: Role;
  petShopId?: string;
}

export class JwtService {
  private readonly secret: string;

  constructor() {
    const secretFromEnv = process.env.JWT_SECRET;
    if (!secretFromEnv) {
      throw new Error('JWT_SECRET environment variable is not set.');
    }
    this.secret = secretFromEnv;
  }

  /**
   * Assina um payload e retorna um token JWT.
   * @param payload Os dados que irão dentro do token.
   */
  sign(payload: IJwtPayload): string {
    return sign(payload, this.secret, {
      expiresIn: '1d', // O token expira em 1 dia.
    });
  }

  /**
   * Verifica um token JWT. Retorna o payload se for válido, ou nulo se for inválido/expirado.
   * @param token O token JWT a ser verificado.
   */
  verify(token: string): IJwtPayload | null {
    try {
      const payload = verify(token, this.secret) as IJwtPayload;
      return payload;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }
}
