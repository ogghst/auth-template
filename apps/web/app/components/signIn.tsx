'use client';

import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import { signIn as nextAuthSignIn } from 'next-auth/react';

export default function SignIn() {
  const router = useRouter();

  const handleSignIn = () => {
    nextAuthSignIn('github', { callbackUrl: '/dashboard' });
  };

  return (
    <Button color="inherit" onClick={handleSignIn}>
      Sign In
    </Button>
  );
}
