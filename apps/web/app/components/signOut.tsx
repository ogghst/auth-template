'use client';

import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import { signOut as nextAuthSignOut } from 'next-auth/react';

export default function SignOut() {
  const router = useRouter();

  const handleSignOut = () => {
    nextAuthSignOut({ callbackUrl: '/' });
  };

  return (
    <Button color="inherit" onClick={handleSignOut}>
      Sign Out
    </Button>
  );
}
