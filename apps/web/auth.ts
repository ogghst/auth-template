import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exchangeGithubToken } from './lib/serverActions';

// Define the types more specifically
interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface JWT {
  accessToken?: string;
  refreshToken?: string;
  sub?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
}

interface TokenProps {
  token: JWT;
  user?: User;
  account?: {
    provider: string;
    access_token?: string;
    providerAccountId?: string;
  };
  profile?: any;
  trigger?: 'signIn' | 'signUp' | 'update';
}

interface SessionProps {
  session: {
    user: User;
    expires: string;
    accessToken?: string; // Store token directly in session
  };
  token: JWT;
}

// Store PKCE code verifier in memory when needed
let codeVerifier: string | null = null;

/**
 * Auth.js configuration
 * @see https://authjs.dev/guides/upgrade-to-v5
 */
export const {
  handlers,
  signIn,
  signOut,
  auth,
}: { handlers: any; signIn: any; signOut: any; auth: any } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug mode
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      authorization: {
        url: 'https://github.com/login/oauth/authorize',
        params: {
          scope: 'read:user user:email',
        },
      },
      token: {
        url: 'https://github.com/login/oauth/access_token',
      },
      userinfo: {
        url: 'https://api.github.com/user',
      },
      profile(profile: any) {
        console.log(
          '[GitHub Provider] Profile:',
          JSON.stringify(profile, null, 2),
        );
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
  ],
  pages: {
    signIn: '/',
    error: '/auth-error',
  },
  callbacks: {
    async jwt({ token, account, profile }: TokenProps): Promise<JWT> {
      console.log('[JWT] Callback starting');
      console.log(`[JWT] Token before:`, JSON.stringify(token, null, 2));
      console.log(
        `[JWT] Account:`,
        account ? JSON.stringify(account, null, 2) : 'null',
      );

      // Initial sign in with GitHub
      if (
        account &&
        profile &&
        account.provider === 'github' &&
        account.access_token
      ) {
        try {
          console.log('[JWT] Processing initial sign in with GitHub');

          // Exchange GitHub token with our backend API
          const apiClient = (await import('./lib/apiClient')).default;
          const authApi = (await import('./lib/apiClient')).authApi;

          console.log('[JWT] Exchanging GitHub token with backend API');
          const exchangeResult = await authApi.exchangeGithubToken(
            account.access_token,
          );

          if (exchangeResult && exchangeResult.accessToken) {
            console.log('[JWT] Successfully exchanged token with backend');

            // Store the backend-issued JWT in our token
            token.accessToken = exchangeResult.accessToken;

            // Store user information if available
            if (exchangeResult.user) {
              token.userId = exchangeResult.user.id;
              token.userEmail = exchangeResult.user.email;
              token.userName = exchangeResult.user.name;
            }

            console.log('[JWT] Token updated with backend JWT');
          } else {
            // Fallback to GitHub token if exchange fails
            console.log(
              '[JWT] Token exchange failed, using GitHub token as fallback',
            );
            token.accessToken = account.access_token;
          }
        } catch (error) {
          console.error('[JWT] Error exchanging token with backend:', error);
          // Fallback to GitHub token
          token.accessToken = account.access_token;
        }
      }

      console.log(`[JWT] Token after:`, JSON.stringify(token, null, 2));
      return token;
    },

    async session({ session, token }: SessionProps) {
      console.log('[Session] Callback starting');
      console.log(
        `[Session] Session before:`,
        JSON.stringify(session, null, 2),
      );
      console.log(`[Session] Token:`, JSON.stringify(token, null, 2));

      if (token && session) {
        // Make sure user object exists
        if (!session.user) {
          session.user = {
            id: '',
            name: '',
            email: '',
            image: '',
          };
        }

        // Set user ID from token
        if (token.sub) {
          session.user.id = token.sub;
        }

        // Use backend user info if available
        if (token.userId) {
          session.user.id = token.userId;
        }

        if (token.userName) {
          session.user.name = token.userName;
        }

        if (token.userEmail) {
          session.user.email = token.userEmail;
        }

        // Add access token to the session for API calls
        if (token.accessToken) {
          session.accessToken = token.accessToken;
          console.log('[Session] Added access token to session');
        } else {
          console.log('[Session] No access token in token object');
        }
      }

      console.log(`[Session] Session after:`, JSON.stringify(session, null, 2));
      return session;
    },

    async authorized({ auth, request }: { auth: any; request: NextRequest }) {
      console.log('[Auth] Authorized callback', request.nextUrl.pathname);
      // Make sure the user is logged in
      const isLoggedIn = !!auth?.user;
      console.log('[Auth] User is logged in:', isLoggedIn);

      // Get the JWT from the session
      const accessToken = auth?.accessToken;
      console.log('[Auth] Has access token:', !!accessToken);

      // If user is logged in and has a valid JWT, set our custom cookies
      if (isLoggedIn && accessToken) {
        // Set our custom access_token cookie if not in middleware
        if (request.nextUrl.pathname.startsWith('/api/')) {
          console.log('[Auth] Setting Authorization header for API request');
          request.headers.set('Authorization', `Bearer ${accessToken}`);
        }

        // When handling a non-API request, we can set cookies
        // This cookie will be detected by our middleware
        if (
          !request.nextUrl.pathname.startsWith('/api/') &&
          typeof Response !== 'undefined'
        ) {
          // Use NextResponse to set cookies - this works in authorized callback
          console.log('[Auth] Setting custom cookies for middleware detection');
          const response = NextResponse.next();
          response.cookies.set('access_token', accessToken, {
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
          });
        }
      }

      // For protected routes, require a logged in user
      if (
        request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/profile') ||
        request.nextUrl.pathname.startsWith('/users')
      ) {
        return isLoggedIn;
      }

      return true;
    },
  },
});

// Extend the session type
declare module 'next-auth' {
  interface Session {
    user: User;
    accessToken?: string;
  }
}
