# API Documentation - Authentication Endpoints

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### 1. Register (Create New User)
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Farmer",
  "email": "john@example.com",
  "password": "password123",
  "role": "farmer",
  "phone": "9876543210",
  "city": "Delhi",
  "state": "Delhi"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Farmer",
    "email": "john@example.com",
    "role": "farmer"
  }
}
```

---

### 2. Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Farmer",
    "email": "john@example.com",
    "role": "farmer",
    "city": "Delhi",
    "state": "Delhi"
  }
}
```

---

### 3. Get Profile (Protected)
**GET** `/auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Profile fetched successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Farmer",
    "email": "john@example.com",
    "role": "farmer",
    "phone": "9876543210",
    "address": "Village XYZ",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "farmSize": 15,
    "farmLocation": {
      "latitude": 28.7041,
      "longitude": 77.1025
    },
    "profileImage": null,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 4. Update Profile (Protected)
**PUT** `/auth/profile`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Farmer Updated",
  "phone": "9876543211",
  "address": "New Village XYZ",
  "city": "Delhi",
  "state": "Delhi",
  "pincode": "110001",
  "farmSize": 20
}
```

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Farmer Updated",
    "email": "john@example.com",
    "role": "farmer",
    "phone": "9876543211",
    "address": "New Village XYZ",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "farmSize": 20
  }
}
```

---

### 5. Change Password (Protected)
**POST** `/auth/change-password`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

---

### 6. Logout (Protected)
**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Please provide email and password"
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid credentials"
}
```

### 401 No Token
```json
{
  "message": "No token provided"
}
```

### 403 Forbidden
```json
{
  "message": "User account is inactive"
}
```

### 404 Not Found
```json
{
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Authentication Flow

1. **User Registration**: POST `/auth/register` → Receive JWT token
2. **Store Token**: Save token in localStorage
3. **Make Requests**: Include `Authorization: Bearer <token>` header
4. **Access Protected Routes**: All protected endpoints require valid token
5. **Token Expiry**: Tokens expire in 7 days (can be refreshed on login)
6. **Logout**: Clear token from localStorage

---

## Demo Credentials

After seeding the database, use these credentials to test:

### Admin Account
- **Email**: admin@farmersupport.com
- **Password**: admin123
- **Role**: admin

### Farmer Account
- **Email**: rajesh@farmer.com
- **Password**: farmer123
- **Role**: farmer

### Customer Account
- **Email**: amit@customer.com
- **Password**: customer123
- **Role**: customer

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "customer"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Profile (after login, replace TOKEN with actual token)
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

---

**Status**: Step 3 Complete - All Authentication APIs Ready
