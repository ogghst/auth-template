# API Documentation

## Base URL

The API base URL depends on your environment:

- Development: `http://localhost:4000`
- Production: Your deployed API URL

## Authentication

All API endpoints except for authentication-related ones require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### Exchange GitHub Token

```http
POST /auth/github
Content-Type: application/json

{
  "code": "github-oauth-code"
}

Response 200:
{
  "accessToken": "jwt-token",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

#### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh-token"
}

Response 200:
{
  "accessToken": "new-jwt-token"
}
```

#### Logout

```http
POST /auth/logout
Authorization: Bearer <your-jwt-token>

Response 200:
{
  "message": "Logged out successfully"
}
```

### User Endpoints

#### Get Current User

```http
GET /user
Authorization: Bearer <your-jwt-token>

Response 200:
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "createdAt": "2024-03-17T10:00:00.000Z",
  "updatedAt": "2024-03-17T10:00:00.000Z"
}
```

#### Get All Users

```http
GET /user/all
Authorization: Bearer <your-jwt-token>

Response 200:
[
  {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "createdAt": "2024-03-17T10:00:00.000Z",
    "updatedAt": "2024-03-17T10:00:00.000Z"
  }
]
```

## Error Responses

The API uses standard HTTP status codes and returns errors in the following format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Error type"
}
```

### Common Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

### Error Examples

#### Invalid Token

```http
Status: 401 Unauthorized
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

#### Token Expired

```http
Status: 401 Unauthorized
{
  "statusCode": 401,
  "message": "Token expired",
  "error": "Unauthorized"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- 100 requests per minute per IP address
- 1000 requests per hour per user

When rate limit is exceeded:

```http
Status: 429 Too Many Requests
{
  "statusCode": 429,
  "message": "Too many requests",
  "error": "Rate limit exceeded"
}
```

## Pagination

Endpoints that return lists support pagination using query parameters:

```http
GET /user/all?page=1&limit=10
```

Response includes pagination metadata:

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## API Versioning

The API uses URL versioning. The current version is v1:

```http
GET /v1/user
```

## WebSocket Events

The API supports WebSocket connections for real-time updates:

```typescript
// Connect to WebSocket
const socket = io('http://localhost:4000');

// Authentication
socket.emit('authenticate', { token: 'jwt-token' });

// Listen for events
socket.on('userUpdated', (data) => {
  console.log('User updated:', data);
});
```

### Available Events

| Event            | Description                           |
| ---------------- | ------------------------------------- |
| `userUpdated`    | Emitted when a user's data is updated |
| `userDeleted`    | Emitted when a user is deleted        |
| `sessionExpired` | Emitted when user's session expires   |
