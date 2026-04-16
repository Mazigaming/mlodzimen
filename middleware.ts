import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function middleware(request: NextRequest) {
  // Only check on server-side requests
  const start = Date.now();
  
  // Skip API routes and static files
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Skip auth pages - allow access to login/register
  if (
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  try {
    // Get config from database
    const config = await prisma.globalConfig.findUnique({
      where: { id: 'config' },
    });

    // If maintenance mode is disabled, allow access
    if (!config?.maintenanceMode) {
      return NextResponse.next();
    }

    // Check for admin session cookie
    const sessionCookie = request.cookies.get('token');

    if (sessionCookie) {
      // Try to validate session
      try {
        const response = await fetch(
          new URL('/api/auth/me', request.url).toString(),
          {
            headers: {
              Cookie: `token=${sessionCookie.value}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.user?.role === 'admin') {
            // Admin user - allow access
            return NextResponse.next();
          }
        }
      } catch {
        // Invalid session - show maintenance page
      }
    }

    // Not admin - redirect to maintenance page
    return NextResponse.redirect(new URL('/maintenance', request.url));
  } catch {
    // If database is not available, allow access in development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.next();
    }
    // In production, show maintenance page if we can't check config
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};