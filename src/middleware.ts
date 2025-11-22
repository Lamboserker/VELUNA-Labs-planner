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
  matcher: [
    // Skip all static assets and public files; protect only application routes.
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|sw.js|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|txt|xml|json|js|css)).*)',
  ],
};
