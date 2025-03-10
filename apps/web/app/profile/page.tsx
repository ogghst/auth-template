'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Divider,
  Paper,
  Grid,
  CircularProgress,
} from '@mui/material';
import { redirect } from 'next/navigation';

export default function ProfilePage() {
  const { data: session, status } = useSession();

  // If not authenticated, redirect to home page
  if (status === 'unauthenticated') {
    redirect('/');
  }

  // Show loading indicator while checking session
  if (status === 'loading') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const user = session?.user;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        User Profile
      </Typography>

      <Paper elevation={3} sx={{ mb: 4, overflow: 'hidden' }}>
        <Box
          sx={{
            p: 3,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Avatar
            src={user?.image || undefined}
            alt={user?.name || 'User'}
            sx={{ width: 80, height: 80, border: '3px solid white' }}
          />
          <Box sx={{ ml: 3 }}>
            <Typography variant="h5">{user?.name}</Typography>
            <Typography variant="body1">{user?.email}</Typography>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Profile Details
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    GitHub ID
                  </Typography>
                  <Typography variant="body1">{user?.id || 'N/A'}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Account Name
                  </Typography>
                  <Typography variant="body1">{user?.name || 'N/A'}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Email Address
                  </Typography>
                  <Typography variant="body1">
                    {user?.email || 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Session Status
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'success.main',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    Active
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-block',
                        ml: 1,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                      }}
                    />
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}
