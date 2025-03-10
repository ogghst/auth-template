'use client';

import Avatar from '@mui/material/Avatar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Box, Tooltip, IconButton } from '@mui/material';

export default function UserAvatar() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;

  const handleAvatarClick = () => {
    if (user) {
      router.push('/profile');
    }
  };

  // Default avatar
  if (!user) {
    return <Avatar sx={{ mr: 2 }} />;
  }

  // User avatar with click functionality
  return (
    <Tooltip title="View Profile">
      <IconButton onClick={handleAvatarClick} size="small" sx={{ p: 0, mr: 2 }}>
        <Avatar
          alt={user.name || 'User'}
          src={user.image || undefined}
          sx={{ width: 40, height: 40 }}
        />
      </IconButton>
    </Tooltip>
  );
}
