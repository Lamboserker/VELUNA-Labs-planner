import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const publicRoutes = createRouteMatcher([
  '/',
  '/auth(.*)',
  '/api/(clerk)(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (!publicRoutes(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
