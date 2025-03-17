'use client';

/**
 * Client-side adapter for the API client
 * This provides browser-specific functionality for client components
 */

// Types
interface AuthError {
  code: string;
  message: string;
}

/**
 * Clear auth cookies in the browser
 */
export const clearAuthCookies = () => {
  document.cookie =
    'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie =
    'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

/**
 * Handle auth errors in client components
 */
export const handleAuthError = (error: AuthError | string) => {
  // Clear cookies
  clearAuthCookies();

  // Redirect to appropriate error page
  const code =
    typeof error === 'string' ? error : error.code || 'unknown_error';
  window.location.href = `/auth-error?code=${code}`;
};

/**
 * Redirect to login page from client components
 */
export const redirectToLogin = () => {
  window.location.href = '/login';
};

/**
 * Check if the user is authenticated on the client side
 * This is useful for quick client-side checks before making server requests
 */
export const isAuthenticated = () => {
  return (
    document.cookie.includes('access_token=') ||
    document.cookie.includes('refresh_token=')
  );
};

/**
 * Client-side logout function
 */
export const logout = async () => {
  try {
    clearAuthCookies();
    // Call the server API to complete logout
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    window.location.href = '/login';
  } catch (error) {
    console.error('Logout failed:', error);
    window.location.href = '/auth-error?code=logout_failed';
  }
};
