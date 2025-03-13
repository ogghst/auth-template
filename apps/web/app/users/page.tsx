import { auth } from '@/auth';
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
  Alert,
} from '@mui/material';

async function getUsers() {
  const session = await auth();

  if (!session?.jwt) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
      headers: {
        Authorization: `Bearer ${session.jwt}`,
      },
      cache: 'no-store', // Don't cache this data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export default async function UsersPage() {
  let users = [];
  let error = null;

  try {
    users = await getUsers();
  } catch (err) {
    error = err.message;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        User Directory
      </Typography>

      {error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      ) : users.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <List sx={{ width: '100%' }}>
            {users.map((user, index) => (
              <Box key={user.id}>
                {index > 0 && <Divider variant="inset" component="li" />}
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar
                      alt={user.displayName || user.username}
                      src={user.avatarUrl}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.displayName || user.username}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {user.email}
                        </Typography>
                        {user.githubProfileUrl && (
                          <Typography
                            component="div"
                            variant="body2"
                            sx={{ mt: 0.5 }}
                          >
                            <a
                              href={user.githubProfileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: 'inherit',
                                textDecoration: 'underline',
                              }}
                            >
                              GitHub Profile
                            </a>
                          </Typography>
                        )}
                        <Typography
                          component="div"
                          variant="caption"
                          sx={{ mt: 0.5 }}
                        >
                          User ID: {user.id}
                        </Typography>
                        <Typography component="div" variant="caption">
                          Joined:{' '}
                          {new Date(user.createdAt).toLocaleDateString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        </Card>
      )}
    </Container>
  );
}
