'use client';

import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';

export default function Home() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Next.js with Material UI
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          A modern web application framework
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="body1">
          This is a simple starter template using Next.js 14 and Material UI 5.
          Customize this page to build your own amazing application!
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {[1, 2, 3].map((item) => (
          <Grid item xs={12} md={4} key={item}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Feature {item}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This is a description of Feature {item}. Replace this with actual
                  content about your application's features and capabilities.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Learn More</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 