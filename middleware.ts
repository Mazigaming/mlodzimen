import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Only check on server-side requests

  // Skip API routes and static files
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Skip auth pages and maintenance page - allow access
  if (
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/maintenance')
  ) {
    return NextResponse.next();
  }

  try {
    // Check for admin session cookie
    const sessionCookie = request.cookies.get('auth_token');

    if (sessionCookie) {
      // Try to validate admin session
      try {
        const response = await fetch(
          new URL('/api/auth/me', request.url).toString(),
          {
            headers: {
              Cookie: `auth_token=${sessionCookie.value}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.user?.role === 'admin' || data.user?.email === 'admin@admin.com') {
            // Admin user - allow access
            return NextResponse.next();
          }
        }
      } catch {
        // Invalid session - continue to maintenance check
      }
    }

    // Check maintenance mode by fetching a status endpoint
    let maintenanceMode = false;

    try {
      const response = await fetch('https://mlodzimentorzy.pl/api/maintenance-status', {
        method: 'GET',
        headers: { 'User-Agent': 'middleware-check' }
      });

      if (response.ok) {
        const data = await response.json();
        maintenanceMode = data.maintenanceMode || false;
      }
    } catch {
      // If API fails, default to allowing access
      maintenanceMode = false;
    }

    // If maintenance mode is disabled, allow access
    if (!maintenanceMode) {
      return NextResponse.next();
    }

    // Maintenance mode is enabled - redirect to maintenance page
    return NextResponse.redirect(new URL('/maintenance', request.url));
  } catch {
    // If file check fails, allow access
    return NextResponse.next();
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
