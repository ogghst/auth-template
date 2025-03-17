# Authentication Flow

## Overview

This document details the authentication flow between the browser, Next.js frontend server, NestJS backend server, and GitHub OAuth provider. The system uses a combination of OAuth 2.0 and JWT tokens to provide secure authentication.

## Components

1. **Browser (Client)**

   - Initiates authentication
   - Stores cookies
   - Makes API requests

2. **Next.js Frontend**

   - Handles OAuth flow with Auth.js
   - Manages sessions
   - Communicates with backend

3. **NestJS Backend**

   - Validates tokens
   - Issues JWTs
   - Manages user data

4. **GitHub OAuth**
   - External authentication provider

## Authentication Flows

### Initial Login Flow

1. User visits `/login`
2. Frontend renders login page
3. User clicks "Login with GitHub"
4. Frontend initiates OAuth flow
5. GitHub shows consent screen
6. User authorizes application
7. GitHub redirects with auth code
8. Frontend exchanges code for GitHub token
9. Frontend sends GitHub token to backend
10. Backend creates/updates user record
11. Backend returns JWT token
12. Frontend sets session cookies
13. User is redirected to dashboard

### API Request Flow

1. User requests protected resource
2. Frontend checks session
3. Frontend includes JWT in API request
4. Backend validates JWT
5. Backend processes request
6. Frontend renders response

### Token Refresh Flow

1. Frontend detects expired token
2. Frontend calls refresh endpoint
3. Backend validates refresh token
4. Backend issues new JWT
5. Frontend updates session
6. Original request is retried

## Security Measures

### Token Security

- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Tokens stored in HTTP-only cookies
- CSRF protection enabled
- Secure and SameSite cookie attributes

### Request Security

1. Check for JWT presence
2. Validate JWT signature
3. Check token expiration
4. Verify permissions
5. Process request or return 401

## Implementation Details

### Frontend Authentication Guard

```typescript
// apps/web/middleware.ts
export async function middleware(request: NextRequest) {
  const session = await getSession(request);

  if (!session) {
    return NextResponse.redirect('/login');
  }

  if (isTokenExpired(session.accessToken)) {
    const newToken = await refreshToken(session.refreshToken);
    if (!newToken) {
      return NextResponse.redirect('/login');
    }
  }

  return NextResponse.next();
}
```

### Backend JWT Strategy

```typescript
// apps/api/src/auth/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: false,
    });
  }

  async validate(payload: JWTPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  }
}
```

## Common Issues and Solutions

1. **Session Not Persisting**

   - Check cookie settings
   - Verify domain configuration
   - Ensure HTTPS in production

2. **Token Refresh Failing**

   - Check token expiration
   - Verify refresh token storage
   - Validate backend endpoints

3. **CORS Issues**
   - Configure allowed origins
   - Check credential settings
   - Verify request headers
