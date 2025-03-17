'use server';

import { redirect } from 'next/navigation';
import apiClient, { authApi, userApi } from './apiClient';
import { auth } from '@/auth';

// Define User interface if not already imported
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Server-side logout action
 */
export async function logout() {
  try {
    // Call the backend to invalidate tokens
    await authApi.logout();

    // Note: Cookies are cleared by the API endpoint
    // We don't need to clear cookies here

    // Redirect to login page
    redirect('/login');
  } catch (error) {
    console.error('Logout error:', error);
    redirect('/auth-error?code=logout_failed');
  }
}

/**
 * Redirect to login page
 */
export async function redirectToLogin(returnUrl?: string) {
  const url = returnUrl
    ? `/login?returnUrl=${encodeURIComponent(returnUrl)}`
    : '/login';
  redirect(url);
}

/**
 * Redirect to error page
 */
export async function redirectToError(code: string = 'session_expired') {
  redirect(`/auth-error?code=${code}`);
}

/**
 * Check if user is authenticated and get profile
 */
export async function getUserProfile() {
  try {
    return await userApi.getProfile();
  } catch (error) {
    // If unauthorized, redirect to login
    if ((error as any).status === 401) {
      await logout();
    }
    return null;
  }
}

/**
 * Get all users
 */
export async function getUsers(): Promise<User[]> {
  console.log('[ServerAction] getUsers: Starting');
  try {
    const session = await auth();
    console.log(
      '[ServerAction] getUsers: Session',
      JSON.stringify(
        {
          user: session?.user,
          hasAccessToken: !!session?.accessToken,
        },
        null,
        2,
      ),
    );

    if (!session?.accessToken) {
      console.log('[ServerAction] getUsers: No accessToken in session');
      throw new Error('Authentication required');
    }

    console.log('[ServerAction] getUsers: Fetching users from backend API');

    // Use the userApi helper with explicit authorization token
    const response = await apiClient.get<User[]>('/user', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!response) {
      console.log('[ServerAction] getUsers: No response from API');
      throw new Error('Failed to fetch users');
    }

    console.log('[ServerAction] getUsers: Success, returned users');
    return response;
  } catch (error) {
    console.error('[ServerAction] getUsers: Error', error);
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: string) {
  try {
    return await userApi.getUserById(id);
  } catch (error) {
    console.error(`Failed to get user ${id}:`, error);
    return null;
  }
}

/**
 * Exchange GitHub token for JWT
 */
export async function exchangeGithubToken(accessToken: string) {
  return await authApi.exchangeGithubToken(accessToken);
}

/**
 * Refresh the access token
 */
export async function refreshToken() {
  return await authApi.refreshToken();
}
