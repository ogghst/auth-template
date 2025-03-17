/**
 * API Client for centralizing all API calls to the backend
 * This encapsulates the fetch API and provides a consistent interface for making requests
 */

// Base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Default headers for JSON API
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Types
interface RequestOptions {
  skipRefreshToken?: boolean;
  headers?: Record<string, string>;
}

interface ApiError extends Error {
  status?: number;
  data?: any;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
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
  private options: {
    baseUrl: string;
  };

  constructor() {
    this.options = {
      baseUrl: API_BASE_URL,
    };
  }

  /**
   * Checks if a URL is absolute (starts with http:// or https://)
   */
  private isAbsoluteUrl(url: string): boolean {
    return /^https?:\/\//i.test(url);
  }

  /**
   * Refreshes an expired JWT token
   */
  async refreshToken(): Promise<string | null> {
    try {
      console.log('Refreshing token...');

      // Use the absolute URL when in server component (no window object)
      const baseUrl =
        typeof window === 'undefined'
          ? process.env.NEXTAUTH_URL || 'http://localhost:3000'
          : '';

      const refreshUrl = `${baseUrl}/api/auth/refresh`;
      console.log(`[API Client] Refresh token URL: ${refreshUrl}`);

      const response = await fetch(refreshUrl, {
        method: 'POST',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Token refresh failed:', data.message);
        return null;
      }

      const data = await response.json();
      return data.accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  /**
   * Makes a request to the API
   */
  private async request<T>(
    method: string,
    url: string,
    data?: any,
    options: RequestOptions = {},
  ): Promise<T | null> {
    const { skipRefreshToken = false } = options;

    try {
      // Default headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add custom headers from options
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          headers[key] = value;
        });
      }

      // Build request options
      const fetchOptions: RequestInit = {
        method,
        headers,
        credentials: 'include', // Always include cookies
      };

      if (data && method !== 'GET') {
        fetchOptions.body = JSON.stringify(data);
      }

      // Check if we're running on the server
      const isServer = typeof window === 'undefined';
      if (isServer) {
        console.log(
          `[API Client] Running in server environment, skipping credentials`,
        );
        // In server environment, we can't use credentials but need to pass Authorization explicitly
        delete fetchOptions.credentials;
      }

      // Build full URL for the API
      let fullUrl: string;

      // If this is an absolute URL, use it directly
      if (this.isAbsoluteUrl(url)) {
        fullUrl = url;
      } else {
        // Otherwise, prefix with base URL
        fullUrl = `${this.options.baseUrl}${url}`;
        console.log(
          `[API Client] ${isServer ? 'Server' : 'Client'} requesting: ${method} ${fullUrl}`,
        );
      }

      // Make the request
      let response = await fetch(fullUrl, fetchOptions);

      // Handle 401 Unauthorized errors by refreshing the token
      if (response.status === 401 && !skipRefreshToken) {
        console.log(
          '[API Client] Unauthorized response, attempting token refresh',
        );
        const newToken = await this.refreshToken();

        if (newToken) {
          console.log(
            '[API Client] Token refreshed successfully, retrying original request',
          );
          // Update Authorization header with new token
          headers['Authorization'] = `Bearer ${newToken}`;
          // Retry the original request
          response = await fetch(fullUrl, { ...fetchOptions, headers });
        } else {
          console.log(
            '[API Client] Token refresh failed, redirecting to login',
          );
          // If we're on the client side, redirect to login
          if (!isServer) {
            window.location.href = '/login';
          }
          return null;
        }
      }

      // Handle successful responses
      if (response.ok) {
        // If response is empty, return null
        if (response.status === 204) {
          return null;
        }

        // Parse JSON response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('[API Client] Successful response:', method, url);
          return data as T;
        }
        return null;
      }

      // Handle error responses
      console.error(`[API Client] Error ${response.status}:`, method, url);
      try {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`,
        );
      } catch (parseError) {
        // If we can't parse the error as JSON, return the status text
        throw new Error(
          `Request failed with status ${response.status}: ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error('[API Client] Request error:', method, url, error);
      throw error;
    }
  }

  /**
   * Makes a GET request to the API
   */
  async get<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T | null> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  /**
   * Makes a POST request to the API
   */
  async post<T>(
    endpoint: string,
    data: any = null,
    options: RequestOptions = {},
  ): Promise<T | null> {
    return this.request<T>('POST', endpoint, data, options);
  }

  /**
   * Makes a PUT request to the API
   */
  async put<T>(
    endpoint: string,
    data: any = null,
    options: RequestOptions = {},
  ): Promise<T | null> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  /**
   * Makes a PATCH request to the API
   */
  async patch<T>(
    endpoint: string,
    data: any = null,
    options: RequestOptions = {},
  ): Promise<T | null> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  /**
   * Makes a DELETE request to the API
   */
  async delete<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T | null> {
    return this.request<T>('DELETE', endpoint, undefined, options);
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
      // Call backend logout
      await apiClient.post('/auth/logout', null, {
        skipRefreshToken: true,
      });

      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      return false;
    }
  },
};

// User API methods
export const userApi = {
  /**
   * Get current user profile
   */
  getProfile: async () => {
    return apiClient.get('/auth/me');
  },

  /**
   * Get all users
   */
  getUsers: async () => {
    return apiClient.get<User[]>('/user');
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string) => {
    return apiClient.get(`/user/${id}`);
  },
};

export default apiClient;
