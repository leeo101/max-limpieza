import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const JWT_SECRET = process.env.JWT_SECRET || 'max-limpieza-secret-key-2024-change-in-production';
  const secret = new TextEncoder().encode(JWT_SECRET);

  // Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    // Allow /admin/login without token
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Check for admin token in cookie (set during login) or Authorization header
    const adminToken =
      request.cookies.get('adminToken')?.value ||
      request.headers.get('authorization')?.split(' ')[1];

    if (!adminToken) {
      // No token → redirect to login
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify the JWT signature and expiry
      const { payload } = await jwtVerify(adminToken, secret);

      // Double-check role: MUST be exactly 'admin'
      if (payload.role !== 'admin') {
        console.warn(
          `[Middleware] Access denied: user role '${payload.role}' is not 'admin'. Path: ${pathname}`
        );
        // Clear the invalid token cookie and redirect to login
        const loginUrl = new URL('/admin/login', request.url);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('adminToken');
        return response;
      }

      // All good — attach admin info to headers for downstream use
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-admin-id', String(payload.id ?? ''));
      requestHeaders.set('x-admin-email', String(payload.email ?? ''));

      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch (err: unknown) {
      // Token is invalid or expired → clear cookie and redirect to login
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Middleware] Invalid/expired admin token:', message);

      const loginUrl = new URL('/admin/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('adminToken');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
