import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from './lib/api-utils';
import { verifyToken } from './lib/auth/jwt';

export async function middleware(request: NextRequest) {
  // Skip API routes, static files, and public assets
  if (
    request.nextUrl.pathname.startsWith('/api/auth') || // Allow auth API calls
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.includes('.') ||
    request.nextUrl.pathname.startsWith('/maintenance') || // Allow maintenance page
    request.nextUrl.pathname.startsWith('/login') || // Allow login page
    request.nextUrl.pathname.startsWith('/register') || // Allow register page
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

  // Check maintenance mode
  let maintenanceMode = false;
  try {
    const maintenanceApiUrl = new URL('/api/maintenance-status', request.url).toString();
    const response = await fetch(maintenanceApiUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'middleware-check' }
    });

    if (response.ok) {
      const data = await response.json();
      maintenanceMode = data.maintenanceMode || false;
    }
  } catch (err) {
    console.error(`Error fetching maintenance status: ${err}`);
    maintenanceMode = false;
  }

  // If maintenance mode is enabled and not an admin, redirect to maintenance page
  if (maintenanceMode) {
    // Admins can bypass maintenance mode
    if (session && (session.role === 'admin' || session.email === 'admin@admin.com')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  // If no session and trying to access protected route, redirect to login
  const protectedRoutes = ['/dashboard', '/mentoring', '/kursy/[id]']; // Add other protected routes here
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route.replace('[id]', '')));

  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).)*',
  ],
};
