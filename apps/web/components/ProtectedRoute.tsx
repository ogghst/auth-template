'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, redirectToLogin } from '../lib/clientApiAdapter';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Client-side component that protects routes from unauthenticated access
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status on the client side
    const checkAuth = async () => {
      try {
        // Quick client-side check
        if (!isAuthenticated()) {
          redirectToLogin();
          return;
        }

        // Verify with the server (optional double-check)
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          redirectToLogin();
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error('Authentication check failed:', error);
        redirectToLogin();
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
