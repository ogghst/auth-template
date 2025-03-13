'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { signIn } from 'next-auth/react';

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Starting GitHub sign-in');

      // Use the standard Next-Auth signIn function with GitHub provider
      // This is the recommended way for client components
      await signIn('github', {
        callbackUrl: '/dashboard',
        redirect: true,
      });

      // Note: With redirect: true, this code below won't run
      // as the browser will be redirected by Next-Auth
    } catch (err) {
      console.error('Error during sign in:', err);
      setError('Sign-in failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        color="inherit"
        onClick={handleSignIn}
        disabled={isLoading}
        startIcon={
          isLoading ? <CircularProgress size={16} color="inherit" /> : null
        }
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </Button>
      {error && (
        <div
          style={{
            color: 'red',
            position: 'absolute',
            bottom: -20,
            whiteSpace: 'nowrap',
          }}
        >
          {error}
        </div>
      )}
    </>
  );
}
