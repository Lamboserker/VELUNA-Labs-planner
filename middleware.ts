import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/api/auth/signin',
  },
});

export const config = {
  matcher: ['/app/:path*', '/plan/:path*', '/inbox/:path*', '/projects/:path*', '/analytics/:path*'],
};
