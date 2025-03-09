'use client';

import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import dynamic from 'next/dynamic';
import Header from './components/Header';
import Providers from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <CssBaseline />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
            }}
          >
            <Header />
            <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
              {children}
            </Container>
            <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper' }}>
              <Container maxWidth="lg">
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  © {new Date().getFullYear()} My Next.js App
                </Typography>
              </Container>
            </Box>
          </Box>
        </Providers>
      </body>
    </html>
  );
}
