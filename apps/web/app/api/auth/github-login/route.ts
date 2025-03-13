import { NextRequest, NextResponse } from 'next/server';
import { generatePKCECodes } from '@/lib/pkce';
import { cookies } from 'next/headers';

/**
 * Server-side route to initiate GitHub login with PKCE
 * This avoids the "headers outside request scope" error
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[API] Starting GitHub PKCE login flow');

    // Generate PKCE codes server-side
    const { codeVerifier, codeChallenge } = await generatePKCECodes();
    console.log('[API] Generated PKCE codes');

    // Store the code verifier in a secure cookie
    const cookieStore = cookies();
    cookieStore.set({
      name: 'pkce_code_verifier',
      value: codeVerifier,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 5, // 5 minutes
      path: '/',
      sameSite: 'lax',
    });

    // Get the callback URL from the query string or use a default
    const searchParams = request.nextUrl.searchParams;
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

    // Make sure we have the GitHub client ID
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      console.error('[API] Missing GITHUB_CLIENT_ID environment variable');
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || request.nextUrl.origin}/auth-error?error=Missing+GitHub+configuration`,
      );
    }

    // Get the base URL for redirect
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;

    // Build the GitHub OAuth URL with PKCE parameters
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${baseUrl}/api/auth/callback/github`,
      scope: 'read:user user:email',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: callbackUrl, // Store the callback URL in the state parameter
    });

    // Redirect to GitHub OAuth login
    const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
    console.log('[API] Redirecting to GitHub OAuth:', githubAuthUrl);

    return NextResponse.redirect(githubAuthUrl);
  } catch (error) {
    console.error('[API] Error initiating GitHub login:', error);
    // Redirect to an error page
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || request.nextUrl.origin}/auth-error?error=Authentication+failed`,
    );
  }
}
