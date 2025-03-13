import { auth } from '@/auth';
import { userApi } from '@/lib/apiClient';
import {
  Typography,
  Container,
  Card,
  CardContent,
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';

async function getUsers() {
  const session = await auth();

  if (!session?.jwt) {
    throw new Error('Authentication required');
  }

  try {
    return await userApi.getUsers(session.jwt);
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export default async function UsersPage() {
  let users;
  let error;

  try {
    users = await getUsers();
  } catch (e) {
    console.error('Error in UsersPage:', e);
    error = e instanceof Error ? e.message : 'An error occurred';
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Card sx={{ bgcolor: '#fdeded', color: '#5f2120', mb: 3 }}>
          <CardContent>
            <Typography variant="h6" component="div">
              Error
            </Typography>
            <Typography variant="body1">{error}</Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (!users) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Users
      </Typography>
      <Card>
        <CardContent>
          <List>
            {users.map((user: any, index: number) => (
              <Box key={user.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar
                      alt={user.displayName || user.username || 'User'}
                      src={user.avatarUrl}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.displayName || user.username || 'Anonymous'}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          display="block"
                        >
                          {user.email || 'No email provided'}
                        </Typography>
                        {user.githubProfileUrl && (
                          <Typography
                            variant="body2"
                            component="span"
                            display="block"
                          >
                            GitHub:{' '}
                            <a
                              href={user.githubProfileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {user.username}
                            </a>
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        </CardContent>
      </Card>
    </Container>
  );
}
