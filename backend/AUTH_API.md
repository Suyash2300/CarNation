# Authentication API Documentation

## Endpoints

### 1. Register / Sign Up
**POST** `/api/auth/register`

Register a new user with role selection.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "BUYER"  // ADMIN, SELLER, or BUYER
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "role": "BUYER",
    "createdAt": "2024-11-02T07:00:00.000Z"
  },
  "token": "jwt-token-here"
}
```

**Error Responses:**
- `400` - Missing required fields or invalid role
- `409` - Email already exists

---

### 2. Login / Sign In
**POST** `/api/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "role": "BUYER"
  },
  "token": "jwt-token-here"
}
```

**Error Responses:**
- `400` - Missing email or password
- `401` - Invalid credentials

---

### 3. Get Current User Profile (Protected)
**GET** `/api/auth/me`

Get the current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "role": "BUYER",
    "profileImage": null,
    "createdAt": "2024-11-02T07:00:00.000Z",
    "updatedAt": "2024-11-02T07:00:00.000Z"
  }
}
```

**Error Responses:**
- `401` - No token or invalid token
- `404` - User not found

---

## User Roles

- **ADMIN**: Can rent out cars (car owner)
- **SELLER**: Can sell used cars
- **BUYER**: Can rent cars and buy used cars

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@carnation.com",
    "password": "admin123",
    "name": "Admin User",
    "role": "ADMIN"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@carnation.com",
    "password": "admin123"
  }'
```

### Get Profile (Protected)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

