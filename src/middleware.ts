import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Chave secreta para verificar o JWT. Deve ser a mesma usada para assinar.
// É CRUCIAL que esta variável de ambiente esteja definida no seu ambiente.
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

export async function middleware(request: NextRequest) {
  // 1. Obter o token do header 'Authorization'
  const tokenHeader = request.headers.get('Authorization');

  if (!tokenHeader || !tokenHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { message: 'Token de autenticação não fornecido ou mal formatado.' },
      { status: 401 },
    );
  }

  const token = tokenHeader.split(' ')[1];

  try {
    // 2. Verificar o JWT usando a biblioteca 'jose'
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // 3. Extrair os IDs do payload do token
    const petShopId = payload.petShopId as string | undefined;
    const clientId = payload.sub; // 'sub' (subject) geralmente guarda o ID do usuário

    // Clonar os headers da requisição para poder modificá-los
    const newHeaders = new Headers(request.headers);

    // 4. Injetar os IDs nos headers para que os controllers possam usá-los
    if (request.nextUrl.pathname.startsWith('/api/petshops/me')) {
      if (!petShopId) {
        throw new Error('Token inválido para a rota de PetShop.');
      }
      newHeaders.set('X-PetShop-ID', petShopId);
    } else if (request.nextUrl.pathname.startsWith('/api/client/me')) {
      if (!clientId) {
        throw new Error('Token inválido para a rota de Cliente.');
      }
      newHeaders.set('X-User-ID', clientId);
    }

    // 5. Prosseguir com a requisição, mas com os novos headers
    return NextResponse.next({
      request: {
        headers: newHeaders,
      },
    });
  } catch (error) {
    // Se a verificação do token falhar, retorna não autorizado
    console.error('Erro de autenticação no middleware:', error);
    return NextResponse.json({ message: 'Token inválido ou expirado.' }, { status: 401 });
  }
}

// Configuração do Middleware
export const config = {
  // O matcher define em quais rotas o middleware será executado.
  // Isso evita que ele rode em rotas públicas, de autenticação, etc.
  matcher: ['/api/petshops/me/:path*', '/api/client/me/:path*'],
};
