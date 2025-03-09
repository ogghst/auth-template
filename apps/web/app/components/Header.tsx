'use client';

import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SignIn from './signIn';
import SignOut from './signOut';
import UserAvatar from './UseAvatar';
import { useSession } from 'next-auth/react'; // Import useSession hook

export default function Header() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const user = session?.user || null;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          My Next.js App
        </Typography>
        {!loading && (
          <>
            {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <UserAvatar />
                <SignOut />
              </Box>
            ) : (
              <SignIn />
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
