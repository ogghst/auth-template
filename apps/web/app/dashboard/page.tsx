'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
    >
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </button>
  );
}

export default function DashboardPage() {
  const session = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (session.status === 'unauthenticated') {
      router.push('/login?from=/dashboard');
    } else if (session.status === 'authenticated') {
      setLoading(false);
    }
  }, [session, router]);

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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Welcome to your authenticated dashboard!
              </p>
            </div>
            <LogoutButton />
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">
              User Information
            </h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-center space-x-4">
                {session.data?.user?.image && (
                  <img
                    src={session.data.user.image}
                    alt="Profile"
                    className="h-12 w-12 rounded-full"
                  />
                )}
                <div>
                  <p className="text-gray-700">
                    <span className="font-semibold">Name:</span>{' '}
                    {session.data?.user?.name || 'Not available'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Email:</span>{' '}
                    {session.data?.user?.email || 'Not available'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">
              Authentication Status
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              You are currently authenticated via{' '}
              <span className="font-medium text-green-600">GitHub</span>
            </p>
            <div className="mt-4 bg-gray-50 p-4 rounded-md">
              <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(session.data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
