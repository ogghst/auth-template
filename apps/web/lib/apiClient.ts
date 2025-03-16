/**
 * API Client for centralizing all API calls to the backend
 * This encapsulates the fetch API and provides a consistent interface for making requests
 */

import { Session } from 'next-auth';

// Base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Default headers for JSON API
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Types
interface RequestOptions extends RequestInit {
  token?: string;
  params?: Record<string, string>;
  skipRefreshToken?: boolean; // Skip token refresh for specific requests (like the refresh call itself)
}

interface ApiError extends Error {
  status?: number;
  data?: any;
}

// Flag to prevent multiple token refresh requests
let isRefreshing = false;
// Queue of requests waiting for token refresh
let refreshQueue: Array<() => void> = [];

// Execute all queued requests
const processQueue = () => {
  refreshQueue.forEach((callback) => callback());
  refreshQueue = [];
};

// Helper to handle response errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error: ApiError = new Error(
      `API Error: ${response.status} - ${response.statusText}`,
    );
    error.status = response.status;

    try {
      error.data = await response.json();
      error.message = error.data?.message || error.message;
    } catch (e) {
      error.data = await response.text();
    }

    // Specific handling for 401 errors
    if (error.status === 401) {
      console.error('Authentication failed:', error.data);
      // Clear invalid tokens
      document.cookie =
        'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie =
        'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    throw error;
  }

  // Return null for 204 No Content
  if (response.status === 204) {
    return null;
  }

  // Parse response as JSON
  return response.json();
};

// Main API client class
class ApiClient {
  /**
   * Handles token refresh when a request fails with 401 Unauthorized
   */
  private async refreshToken(): Promise<string | null> {
    if (isRefreshing) {
      return new Promise<string | null>((resolve) => {
        refreshQueue.push(() => resolve(null));
      });
    }

    isRefreshing = true;

    try {
      const result = await this.post<{ accessToken: string }>(
        '/auth/refresh',
        null,
        { skipRefreshToken: true },
      );

      if (!result?.accessToken) {
        throw new Error('No access token in refresh response');
      }

      isRefreshing = false;
      processQueue();
      return result.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      isRefreshing = false;
      processQueue();

      // Force logout on refresh failure
      await authApi.logout();
      window.location.href = '/auth-error?code=session_expired';
      return null;
    }
  }

  /**
   * Makes a request to the API
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const {
      token,
      params,
      skipRefreshToken = false,
      ...fetchOptions
    } = options;

    // Build URL with query parameters
    let url = `${API_BASE_URL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, value);
      });
      url += `?${searchParams.toString()}`;
    }

    // Prepare headers
    const headers = new Headers(DEFAULT_HEADERS);

    // Add authorization header if token provided
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    // Merge with any custom headers
    if (fetchOptions.headers) {
      Object.entries(fetchOptions.headers).forEach(([key, value]) => {
        headers.append(key, value);
      });
    }

    // Make the request
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        credentials: 'include', // Always include cookies
      });

      // Handle 401 Unauthorized errors by refreshing the token
      if (response.status === 401 && !skipRefreshToken) {
        console.log('Token expired, attempting refresh');

        // Try to refresh the token
        const newToken = await this.refreshToken();

        // If we have a new token, retry the request with it
        if (newToken) {
          headers.set('Authorization', `Bearer ${newToken}`);
        }

        // Retry the original request
        const retryResponse = await fetch(url, {
          ...fetchOptions,
          headers,
          credentials: 'include',
        });

        return handleResponse(retryResponse);
      }

      return handleResponse(response);
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  public async get<T = any>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  public async post<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {},
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  public async put<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {},
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  public async patch<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {},
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  public async delete<T = any>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

// Create API client instance
const apiClient = new ApiClient();

// Auth API methods
export const authApi = {
  /**
   * Check if user is authenticated
   */
  checkSession: async (): Promise<{ user: any } | null> => {
    try {
      return await fetch('/api/auth/session').then((res) => res.json());
    } catch (error) {
      console.error('[Auth API] Error checking session:', error);
      return null;
    }
  },

  /**
   * Exchange GitHub token for our application JWT
   */
  exchangeGithubToken: async (accessToken: string) => {
    return apiClient.post<{
      accessToken: string;
      isNewUser: boolean;
      user: {
        id: string;
        email: string;
        name: string;
        image: string;
      };
    }>('/auth/exchange-token', {
      provider: 'github',
      access_token: accessToken,
    });
  },

  /**
   * Exchange authorization code for tokens
   */
  exchangeCode: async (code: string, codeVerifier: string) => {
    return apiClient.post<{
      accessToken: string;
      isNewUser: boolean;
      user: {
        id: string;
        email: string;
        name: string;
        image: string;
      };
    }>('/auth/exchange-code', {
      code,
      code_verifier: codeVerifier,
    });
  },

  /**
   * Refresh access token
   */
  refreshToken: async () => {
    return apiClient.post<{ accessToken: string }>('/auth/refresh', null, {
      skipRefreshToken: true, // Prevent infinite loop
    });
  },

  /**
   * Logout user (revoke tokens)
   */
  logout: async () => {
    try {
      // Clear frontend cookies
      document.cookie =
        'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie =
        'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

      // Call backend logout
      return apiClient.post('/auth/logout', null, {
        skipRefreshToken: true,
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  },
};

// User API methods
export const userApi = {
  /**
   * Get current user profile
   */
  getProfile: async (token: string) => {
    return apiClient.get('/auth/me', { token });
  },

  /**
   * Get all users
   */
  getUsers: async (token: string) => {
    return apiClient.get('/user', { token });
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string, token: string) => {
    return apiClient.get(`/user/${id}`, { token });
  },
};

export default apiClient;
