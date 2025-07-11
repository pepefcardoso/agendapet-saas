import { NextRequest, NextResponse } from 'next/server';
import { JwtService } from './infra/providers/JwtService';

export async function middleware(request: NextRequest) {
  const jwtService = new JwtService();

  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    return NextResponse.json({ message: 'Authorization header is missing.' }, { status: 401 });
  }

  const [, token] = authHeader.split(' ');

  if (!token) {
    return NextResponse.json({ message: 'Token is missing.' }, { status: 401 });
  }

  const payload = jwtService.verify(token);

  if (!payload) {
    return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 401 });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('X-User-ID', payload.sub);

  if (payload.role) {
    requestHeaders.set('X-User-Role', payload.role);
  }
  if (payload.petShopId) {
    requestHeaders.set('X-PetShop-ID', payload.petShopId);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas de API, exceto as de autenticação
     * e outras rotas públicas que possamos vir a ter.
     */
    '/api/petshops/me/:path*',
    '/api/client/me/:path*',
  ],
};
