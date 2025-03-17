'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Error messages for different error codes
const errorMessages: Record<string, string> = {
  session_expired: 'Your session has expired. Please sign in again.',
  default: 'An authentication error occurred.',
  access_denied: 'Access was denied. Please check your permissions.',
  invalid_token: 'Invalid authentication token.',
  logout_failed: 'Failed to log out properly.',
  configuration: 'Authentication system configuration error.',
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  // Get error code from URL
  const errorCode = searchParams.get('code') || 'default';
  const errorMessage = errorMessages[errorCode] || errorMessages.default;

  // Auto-redirect to login after countdown
  useEffect(() => {
    if (countdown <= 0) {
      router.push('/login');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full px-6 py-8 bg-white shadow-md rounded-lg">
        <div className="text-center">
          <h1 className="text-red-600 text-4xl mb-4">Authentication Error</h1>

          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            {errorMessage}
          </div>

          <p className="mb-6 text-gray-600">
            You will be redirected to the login page in {countdown} seconds...
          </p>

          <button
            onClick={() => router.push('/login')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}
