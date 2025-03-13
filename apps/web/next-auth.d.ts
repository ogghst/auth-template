import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
    };
    jwt: string; // JWT token from our backend
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    jwt: string; // JWT token from our backend
    code?: string; // Authorization code
    code_verifier?: string; // PKCE code verifier
  }
}
