'use client';

import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  My Next.js App
                </Typography>
              </Toolbar>
            </AppBar>
            <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
              {children}
            </Container>
            <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper' }}>
              <Container maxWidth="lg">
                <Typography variant="body2" color="text.secondary" align="center">
                  © {new Date().getFullYear()} My Next.js App
                </Typography>
              </Container>
            </Box>
          </Box>
        </ThemeProvider>
      </body>
    </html>
  );
} 