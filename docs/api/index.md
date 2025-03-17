# API Documentation

## Base URL

- Development: `http://localhost:4000`
- Production: Your deployed API URL

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Exchange GitHub Token

```http
POST /auth/github
Content-Type: application/json

{
  "code": "github-oauth-code"
}
```

Response:

```json
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
```

Response:

```json
{
  "accessToken": "new-jwt-token"
}
```

#### Logout

```http
POST /auth/logout
Authorization: Bearer <your-jwt-token>
```

Response:

```json
{
  "message": "Logged out successfully"
}
```

### Users

#### Get Current User

```http
GET /user
Authorization: Bearer <your-jwt-token>
```

Response:

```json
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
```

Response:

```json
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

The API uses standard HTTP status codes and returns errors in this format:

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

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per user

Rate limit exceeded response:

```json
{
  "statusCode": 429,
  "message": "Too many requests",
  "error": "Rate limit exceeded"
}
```

## Pagination

List endpoints support pagination:

```http
GET /user/all?page=1&limit=10
```

Response includes metadata:

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
