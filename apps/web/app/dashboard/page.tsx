import { auth } from '@/auth';
import { userApi } from '@/lib/apiClient';
import {
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Box,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import Link from 'next/link';

async function getUserProfile() {
  const session = await auth();

  if (!session?.jwt) {
    throw new Error('Authentication required');
  }

  try {
    return await userApi.getProfile(session.jwt);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

export default async function DashboardPage() {
  const userProfile = await getUserProfile();

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* User Profile Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Your Profile" />
            <Divider />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  src={userProfile.avatarUrl}
                  alt={userProfile.displayName || userProfile.username}
                  sx={{ width: 80, height: 80, mr: 2 }}
                />
                <Box>
                  <Typography variant="h6" component="div">
                    {userProfile.displayName || userProfile.username}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {userProfile.email}
                  </Typography>
                  {userProfile.githubProfileUrl && (
                    <Button
                      variant="text"
                      size="small"
                      component="a"
                      href={userProfile.githubProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ mt: 1, p: 0 }}
                    >
                      GitHub Profile
                    </Button>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Quick Actions" />
            <Divider />
            <CardContent>
              <List>
                <ListItem disablePadding>
                  <ListItemText
                    primary={
                      <Button
                        component={Link}
                        href="/users"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mb: 2 }}
                      >
                        View All Users
                      </Button>
                    }
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText
                    primary={
                      <Button
                        component="a"
                        href="/api/auth/signout"
                        variant="outlined"
                        color="error"
                        fullWidth
                      >
                        Sign Out
                      </Button>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
