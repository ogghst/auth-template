# Getting Started

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18 or higher
- pnpm 8 or higher
- Git
- A GitHub account for OAuth setup

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

Create `.env` files in both `apps/web` and `apps/api` directories:

For `apps/web/.env`:

```env
# Next Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# GitHub OAuth
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# API
NEXT_PUBLIC_API_URL=http://localhost:4000
```

For `apps/api/.env`:

```env
# Database
DATABASE_URL=sqlite:./data/db.sqlite

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION=15m

# GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## GitHub OAuth Setup

1. Go to GitHub Developer Settings
2. Create a new OAuth App
3. Set the homepage URL to `http://localhost:3000`
4. Set the callback URL to `http://localhost:3000/api/auth/callback/github`
5. Copy the Client ID and Client Secret to your `.env` files

## Development

1. Start the development servers:

```bash
pnpm dev
```

This will start both the frontend and backend servers:

- Frontend: http://localhost:3000
- Backend: http://localhost:4000

2. Visit http://localhost:3000 in your browser
3. Click "Login with GitHub" to test the authentication flow

## Database Setup

The application uses SQLite with TypeORM. Migrations will run automatically on startup, but you can also run them manually:

```bash
# Generate a migration
cd apps/api
pnpm typeorm:migration:generate ./src/migrations/init

# Run migrations
pnpm typeorm:migration:run
```

## Testing

Run tests across all packages:

```bash
pnpm test
```

Or test specific packages:

```bash
pnpm test:web    # Frontend tests
pnpm test:api    # Backend tests
```

## Building for Production

Build all packages:

```bash
pnpm build
```

The built artifacts will be in the respective `dist` directories.

## Deployment

### Frontend (Next.js)

Deploy to Vercel:

```bash
vercel
```

### Backend (NestJS)

1. Build the Docker image:

```bash
docker build -t your-app-api ./apps/api
```

2. Run the container:

```bash
docker run -p 4000:4000 your-app-api
```

## Troubleshooting

### Common Issues

1. **Authentication Error**

   - Verify GitHub OAuth credentials
   - Check callback URLs
   - Ensure environment variables are set

2. **Database Connection Error**

   - Check DATABASE_URL in `.env`
   - Ensure SQLite file exists
   - Run migrations

3. **Build Errors**
   - Clear node_modules: `pnpm clean`
   - Reinstall dependencies: `pnpm install`
   - Check TypeScript errors: `pnpm type-check`

## Next Steps

- Review the [API Documentation](../api)
- Learn about [Authentication Flow](../auth/flow)
- Explore [Advanced Features](../advanced-features)
