import { auth } from '@/auth';

export default auth;

export const config = {
  matcher: [
    // Protected routes
    '/dashboard',
    '/profile',
    '/users',
    // API routes
    '/api/:path*',
  ],
};
