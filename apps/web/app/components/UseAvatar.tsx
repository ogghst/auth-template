'use client';

import Avatar from '@mui/material/Avatar';
import { useSession } from 'next-auth/react';

export default function UserAvatar() {
  const { data: session } = useSession();
  const user = session?.user;

  // Default avatar
  if (!user) {
    return <Avatar sx={{ mr: 2 }} />;
  }

  // User avatar
  return (
    <Avatar
      alt={user.name || 'User'}
      src={user.image || undefined}
      sx={{ mr: 2 }}
    />
  );
}
