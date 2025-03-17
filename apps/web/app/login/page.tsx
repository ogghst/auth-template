'use client';

import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/dashboard';

  const handleLogin = async () => {
    setIsLoading(true);

    await signIn('github', {
      callbackUrl: from,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="mt-2 text-gray-600">Sign in to access your account</p>
          {from && from !== '/' && (
            <p className="mt-1 text-sm text-blue-600">
              You'll be redirected to: {from}
            </p>
          )}
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isLoading ? 'Loading...' : 'Sign in with GitHub'}
        </button>
      </div>
    </div>
  );
}
