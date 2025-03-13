'use client';

import { useSearchParams } from 'next/navigation';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'An authentication error occurred';

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
        }}
      >
        <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />

        <Typography variant="h4" component="h1" gutterBottom align="center">
          Authentication Error
        </Typography>

        <Typography
          variant="body1"
          paragraph
          align="center"
          color="text.secondary"
        >
          {error}
        </Typography>

        <Typography
          variant="body2"
          paragraph
          align="center"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          There was a problem with the authentication process. Please try again
          or contact support if the issue persists.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button component={Link} href="/" variant="contained" color="primary">
            Return Home
          </Button>

          <Button component={Link} href="/api/auth/signin" variant="outlined">
            Try Again
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
