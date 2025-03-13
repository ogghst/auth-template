import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// Define the types more specifically
interface TokenProps {
  token: any;
  user?: any;
  account?: any;
  trigger?: 'signIn' | 'signUp' | 'update';
}

interface SessionProps {
  session: any;
  token: any;
}

// Store PKCE code verifier in memory when needed
let codeVerifier: string | null = null;

export const {
  handlers,
  signIn,
  signOut,
  auth,
}: { handlers: any; signIn: any; signOut: any; auth: any } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          // Enable PKCE
          code_challenge_method: 'S256',
        },
      },
    }),
  ],
  pages: {
    signIn: '/',
    error: '/auth-error',
  },
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async jwt({ token, account, user, trigger }: TokenProps) {
      console.log(`[JWT] Callback triggered by: ${trigger || 'unknown'}`);

      // On sign in with account data (initial OAuth response)
      if (account && user) {
        console.log('[JWT] Processing initial sign-in with account data');

        // If we have GitHub access token directly from OAuth
        if (account.access_token) {
          console.log('[JWT] Using GitHub access token from account');
          token.accessToken = account.access_token;
          token.providerAccountId = account.providerAccountId;
        }

        // If we have GitHub profile data
        if (user) {
          token.id = user.id;
          token.name = user.name;
          token.email = user.email;
          token.image = user.image;
        }

        // If we need to exchange the code for tokens with our backend
        if (
          account.provider === 'github' &&
          !token.jwt &&
          account.access_token
        ) {
          try {
            console.log(
              '[JWT] Getting our own JWT from backend using GitHub token',
            );

            // Exchange the GitHub token for our application JWT
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/auth/exchange-token`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  provider: 'github',
                  access_token: account.access_token,
                }),
                credentials: 'include',
              },
            );

            if (response.ok) {
              const data = await response.json();
              token.jwt = data.accessToken;
              console.log('[JWT] Successfully obtained application JWT');
            } else {
              console.error(
                '[JWT] Failed to exchange GitHub token:',
                response.status,
              );
            }
          } catch (error) {
            console.error('[JWT] Error exchanging GitHub token:', error);
          }
        }
      }

      return token;
    },

    async session({ session, token }: SessionProps) {
      // Make the JWT available to the client
      session.jwt = token.jwt;

      // Pass user data to the session
      if (token.id) {
        session.user.id = token.id;
        session.user.name = token.name || session.user.name;
        session.user.email = token.email || session.user.email;
        session.user.image = token.image || session.user.image;
      }

      return session;
    },

    async authorized({ auth, request }: { auth: any; request: NextRequest }) {
      // Make sure the user is logged in
      const isLoggedIn = !!auth?.user;

      // Get the JWT from the session
      const jwt = auth?.jwt;

      // If user is logged in and has a valid JWT, add it to API requests
      if (isLoggedIn && jwt && request.nextUrl.pathname.startsWith('/api/')) {
        request.headers.set('Authorization', `Bearer ${jwt}`);
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
