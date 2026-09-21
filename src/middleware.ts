import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * OWASP A01: Broken Access Control
 * Middleware de proteção estrita para todas as áreas restritas do painel administrativo.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteção do Painel Administrativo
  if (pathname.startsWith('/admin')) {
    // Permitir acesso à página de login e assets estáticos do admin
    if (pathname === '/admin/login') {
      // Se já estiver logado e tentar ir para o login, redirecionar para o dashboard
      const session = request.cookies.get('gallo_session');
      if (session?.value === 'authenticated_admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // Verificar cookie seguro de sessão
    const session = request.cookies.get('gallo_session');
    if (!session || session.value !== 'authenticated_admin') {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
