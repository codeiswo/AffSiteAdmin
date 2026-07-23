import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - api/deploy-callback (actions webhook callback)
     * - login (login page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|api/deploy-callback|login|_next/static|_next/image|favicon.ico).*)',
  ],
};

export async function middleware(request) {
  const token = request.cookies.get('sitespro_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    // Clear invalid cookie and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('sitespro_token');
    return response;
  }

  return NextResponse.next();
}
