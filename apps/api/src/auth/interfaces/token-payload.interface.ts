export interface TokenPayload {
  sub: string; // User ID
  jti?: string; // JWT ID (for refresh tokens)
  iat?: number; // Issued at
  exp?: number; // Expiration time
}
