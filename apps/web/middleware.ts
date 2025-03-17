import { NextResponse, type NextRequest } from 'next/server';

// Define which routes are public and which are protected
const PUBLIC_ROUTES = ['/login', '/auth-error', '/api/auth', '/_next'];
const PROTECTED_ROUTES = ['/dashboard', '/profile', '/users', '/api/users'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log('[Middleware] Processing path:', pathname);

  // Check if it's a public route that doesn't need authentication
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    console.log('[Middleware] Public route, skipping auth check');
    return NextResponse.next();
  }

  // Check if it's a protected route that needs authentication
  const requiresAuth = PROTECTED_ROUTES.some(
    (route) => pathname.startsWith(route) || pathname === route,
  );

  if (requiresAuth) {
    console.log('[Middleware] Protected route, checking auth');

    // Check for authentication using cookies or Cookie header for server-to-server requests
    let hasSessionCookie = false;

    // First check cookies
    const cookies = request.cookies;
    const cookieNames = cookies
      .getAll()
      .map((c) => c.name)
      .join(', ');
    console.log('[Middleware] Cookies:', cookieNames || 'none');

    // Check for session cookie in standard cookies
    const sessionCookie =
      cookies.get('authjs.session-token') ||
      cookies.get('__Secure-authjs.session-token');

    if (sessionCookie) {
      hasSessionCookie = true;
    } else {
      // For server-to-server requests, check Cookie header
      const cookieHeader = request.headers.get('cookie');
      console.log('[Middleware] Cookie header:', cookieHeader || 'none');

      if (
        cookieHeader &&
        (cookieHeader.includes('authjs.session-token=') ||
          cookieHeader.includes('__Secure-authjs.session-token='))
      ) {
        hasSessionCookie = true;
      }

      // Also check Authorization header as a fallback
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        console.log('[Middleware] Found Authorization header');
        hasSessionCookie = true;
      }
    }

    if (!hasSessionCookie) {
      console.log('[Middleware] No session cookie found, redirecting to login');
      // If no session cookie, redirect to login page
      return NextResponse.redirect(new URL('/login', request.url));
    }

    console.log('[Middleware] Session cookie found, allowing access');
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except for static files, images, and other assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};
