import { NextRequest, NextResponse } from 'next/server';
import apiClient from '@/lib/apiClient';

export async function GET(request: NextRequest) {
  try {
    // Get cookies from the request
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Missing access token' },
        { status: 401 },
      );
    }

    // Verify token with the backend
    try {
      // Call backend auth/me endpoint to verify token
      await apiClient.get('/auth/me');

      // Return success if verified
      return NextResponse.json({ authenticated: true });
    } catch (error: any) {
      console.error('Token verification failed:', error);

      // Return unauthorized if verification fails
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or expired token' },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error('Authentication verification error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
