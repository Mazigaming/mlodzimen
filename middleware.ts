import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from './lib/api-utils';
import { verifyToken } from './lib/auth/jwt';

export const runtime = 'nodejs';

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).)*',
  ],
};

export { middleware };

async function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.includes('.') ||
    request.nextUrl.pathname.startsWith('/maintenance') ||
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname.startsWith('/forgot-password') ||
    request.nextUrl.pathname.startsWith('/reset-password') ||
    request.nextUrl.pathname.startsWith('/verify-email')
  ) {
    return NextResponse.next();
  }

  let session: any = null;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (token) {
    session = verifyToken(token);
    
    if (!session) {
      const response = NextResponse.redirect(new URL('/login?error=invalid', request.url));
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }
  }

  const protectedRoutes = ['/dashboard', '/mentoring', '/kursy', '/o-nas', '/artykuly', '/partnerzy', '/kontakt'];
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
