import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { authApi } from '@/lib/apiClient';

/**
 * Endpoint to refresh access tokens
 * This uses NextAuth session to retrieve token information and calls
 * the backend API to refresh the token
 */
export async function POST() {
  console.log('[API Refresh] Starting token refresh');
  try {
    // Get the current session
    const session = await auth();
    console.log('[API Refresh] Session:', session ? 'Found' : 'Not found');

    if (session) {
      console.log(
        '[API Refresh] User in session:',
        session.user?.email || 'No email',
      );
      console.log('[API Refresh] Access token exists:', !!session.accessToken);
    }

    // If no session or no accessToken, return unauthorized
    if (!session?.accessToken) {
      console.log('[API Refresh] No valid session or token');
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Refresh token not found',
        },
        { status: 401 },
      );
    }

    try {
      // Call backend API to refresh the token
      console.log('[API Refresh] Calling backend API to refresh token');
      const refreshResult = await authApi.refreshToken();

      if (refreshResult && refreshResult.accessToken) {
        console.log('[API Refresh] Successfully refreshed token from backend');

        // Return the new token from the backend
        return NextResponse.json(
          {
            accessToken: refreshResult.accessToken,
            user: session.user,
          },
          {
            headers: {
              'Cache-Control': 'no-store, max-age=0',
            },
          },
        );
      }
    } catch (refreshError) {
      console.error(
        '[API Refresh] Error refreshing with backend:',
        refreshError,
      );
      // Fall through to use session token
    }

    console.log('[API Refresh] Using session token as fallback');
    // Return the current token from the session as fallback
    return NextResponse.json(
      {
        accessToken: session.accessToken,
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      },
    );
  } catch (error) {
    console.error('[API Refresh] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
