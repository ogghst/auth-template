import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

export const {
  handlers,
  signIn,
  signOut,
  auth,
}: { handlers: any; signIn: any; signOut: any; auth: any } = NextAuth({
  providers: [GitHub],
  callbacks: {
    jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        // User is available during sign-in
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }: { token: any; session: any }) {
      session.user.id = token.id;
      return session;
    },
  },
});
