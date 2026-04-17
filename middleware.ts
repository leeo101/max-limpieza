import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const JWT_SECRET = process.env.JWT_SECRET || 'max-limpieza-secret-key-2024-change-in-production';
  const secret = new TextEncoder().encode(JWT_SECRET);

  // Check if the path is under /admin
  if (pathname.startsWith('/admin')) {
    // Allow /admin/login without token
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Check for admin token in cookie or authorization header
    const adminToken = request.cookies.get('adminToken')?.value || 
                       request.headers.get('authorization')?.split(' ')[1];

    if (!adminToken) {
      // Redirect to login if no token
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify the token validity and its payload
      const { payload } = await jwtVerify(adminToken, secret);
      
      // Strict role check: must be admin to access /admin routes
      if (payload.role !== 'admin') {
        const loginUrl = new URL('/admin/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    } catch (err: any) {
      // If token is invalid or expired, redirect to login
      console.error('Security middleware: Access denied / Invalid token:', err.message);
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
