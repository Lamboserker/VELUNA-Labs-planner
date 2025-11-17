import { NextRequest, NextResponse } from 'next/server';
import { clerkMiddleware, type ClerkMiddlewareAuth } from '@clerk/nextjs/server';

const publicRoutes = ['/', '/auth'];
const publicApiRoutes = ['/api/(clerk)'];

const shouldProtectPath = (pathname: string) => {
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return false;
  }
  if (publicApiRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return false;
  }
  return ['/app', '/plan', '/inbox', '/projects', '/analytics', '/api'].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
};

function middlewareHandler(auth: ClerkMiddlewareAuth, request: NextRequest) {
  if (shouldProtectPath(request.nextUrl.pathname)) {
    if (!auth.userId) {
      const returnBackUrl = `${request.nextUrl.pathname}${request.nextUrl.search}`;
      const signInUrl = new URL('/auth', request.url);
      signInUrl.searchParams.set('returnBackUrl', returnBackUrl);
      return NextResponse.redirect(signInUrl);
    }
  }
}

export default clerkMiddleware(middlewareHandler);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
