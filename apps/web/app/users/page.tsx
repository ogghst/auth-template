import { getUsers } from '@/lib/serverActions';

// Define User interface
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const UsersPage = async () => {
  try {
    const users = await getUsers();

    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Users</h1>
        <ul className="space-y-2">
          {users.map((user: User) => (
            <li key={user.id} className="p-3 bg-white rounded shadow">
              <p>
                <strong>Name:</strong> {user.name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Role:</strong> {user.role}
              </p>
            </li>
          ))}
        </ul>
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Users</h1>
        <div className="p-4 bg-red-50 text-red-500 rounded">
          {error instanceof Error ? error.message : 'Failed to load users'}
        </div>
      </div>
    );
  }
};

export default UsersPage;
