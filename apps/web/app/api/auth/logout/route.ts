import { NextResponse } from 'next/server';
import { authApi } from '@/lib/apiClient';

export async function POST() {
  try {
    // Call the server-side logout function
    await authApi.logout();

    // Create a response with expired cookies
    const response = NextResponse.json({ success: true });

    // Set cookies to expire
    response.cookies.set({
      name: 'access_token',
      value: '',
      expires: new Date(0),
      path: '/',
    });

    response.cookies.set({
      name: 'refresh_token',
      value: '',
      expires: new Date(0),
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
