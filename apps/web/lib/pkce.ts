/**
 * PKCE (Proof Key for Code Exchange) helper functions
 * Used for securing the OAuth authorization code flow
 */

// Generate a random string for the code verifier
export function generateCodeVerifier(length: number = 128): string {
  // Characters that can be used in the code verifier
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let text = '';

  // Generate a random string
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

// Generate a code challenge from the code verifier using SHA-256
export async function generateCodeChallenge(
  codeVerifier: string,
): Promise<string> {
  // Convert the code verifier to a buffer
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);

  // Hash the code verifier using SHA-256
  const digest = await crypto.subtle.digest('SHA-256', data);

  // Convert the hash to a base64 string
  return base64UrlEncode(digest);
}

// Base64 URL encoding function
function base64UrlEncode(buffer: ArrayBuffer): string {
  // Convert the buffer to a base64 string
  let base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

  // Convert the base64 string to a base64url string
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Generate both a code verifier and its corresponding challenge
export async function generatePKCECodes(): Promise<{
  codeVerifier: string;
  codeChallenge: string;
}> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  return { codeVerifier, codeChallenge };
}
