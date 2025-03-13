import { signIn } from '@/auth';
import { generatePKCECodes } from './pkce';

/**
 * Initiates GitHub login with PKCE
 * This function generates the code verifier and challenge,
 * then calls the signIn function with the GitHub provider
 */
export async function signInWithGitHubPKCE() {
  try {
    console.log('[Auth] Starting GitHub PKCE login flow');

    // Generate PKCE codes
    const { codeVerifier, codeChallenge } = await generatePKCECodes();
    console.log('[Auth] Generated PKCE codes');
    console.log(`[Auth] Code verifier length: ${codeVerifier.length}`);
    console.log(`[Auth] Code challenge length: ${codeChallenge.length}`);

    // Store the code verifier in sessionStorage for later use
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pkce_code_verifier', codeVerifier);
    }

    // Use the Next.js 5 compatible approach for client components
    // This redirects the browser directly instead of using the headers API
    window.location.href = `/api/auth/signin/github?${new URLSearchParams({
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      callbackUrl: '/dashboard',
    })}`;

    return true;
  } catch (error) {
    console.error('[Auth] Error in GitHub PKCE login:', error);
    throw error;
  }
}

/**
 * Get the stored code verifier from session storage
 * This should be called in the callback page
 */
export function getStoredCodeVerifier(): string | null {
  if (typeof window === 'undefined') return null;

  const verifier = sessionStorage.getItem('pkce_code_verifier');

  // Clear the verifier after using it
  if (verifier) {
    sessionStorage.removeItem('pkce_code_verifier');
  }

  return verifier;
}

/**
 * Check if a user is authenticated by examining the session
 * This is a client-side function
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await fetch('/api/auth/session');
    const data = await session.json();
    return !!data.user;
  } catch (error) {
    console.error('[Auth] Error checking authentication:', error);
    return false;
  }
}
