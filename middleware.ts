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

  // Skip auth pages - allow access to login/register
  if (
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  try {
    // Get user IP address
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') ||
                     request.headers.get('cf-connecting-ip') ||
                     '127.0.0.1';

    // Allowed IPs (your server IP and any other trusted IPs)
    const allowedIPs = [
      '46.247.108.173', // Your VPS IP
      '127.0.0.1',      // Localhost
      '::1'             // IPv6 localhost
    ];

    // Check if IP is allowed
    const isAllowedIP = allowedIPs.includes(clientIP);

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
          if (data.user?.role === 'admin' || data.user?.email === 'admin@admin.com') {
            // Admin user - allow access
            return NextResponse.next();
          }
        }
      } catch {
        // Invalid session - check IP whitelist
      }
    }

    // Allow access if IP is whitelisted
    if (isAllowedIP) {
      return NextResponse.next();
    }

    // Block access for everyone else - redirect to maintenance page
    return NextResponse.redirect(new URL('/maintenance', request.url));
  } catch {
    // If database is not available, only allow localhost in development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.next();
    }
    // In production, block access if we can't verify
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