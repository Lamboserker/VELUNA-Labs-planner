import { NextRequest } from 'next/server';
import { clerkMiddleware, type ClerkMiddlewareAuth } from '@clerk/nextjs/server';

const publicRoutes = ['/', '/auth'];

const shouldProtectPath = (pathname: string) => {
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return false;
  }
  return ['/app', '/plan', '/inbox', '/projects', '/analytics', '/api'].some((route) => pathname === route || pathname.startsWith(`${route}/`));
};

function middlewareHandler(auth: ClerkMiddlewareAuth, request: NextRequest) {
  if (shouldProtectPath(request.nextUrl.pathname)) {
    if (!auth.userId) {
      return auth.redirectToSignIn({
        returnBackUrl: request.url,
      });
    }
  }
}

export default clerkMiddleware(middlewareHandler);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
