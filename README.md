# Express Security Example

This project demonstrates secure authentication using Express.js and TypeScript with JWT tokens, Redis token storage, and password hashing.

## Features

### Backend
- **Authentication API** with signup, login, refresh, logout and profile endpoints
- **JWT Token** based authentication with access and refresh tokens
- **Redis Storage** for refresh tokens with in-memory fallback
- **Password Hashing** using bcrypt
- **Input Validation** with detailed error messages
- **Rate Limiting** to prevent brute force attacks
- **CORS** configuration

### Frontend
- **Vanilla JavaScript** client application (no frameworks)
- **Responsive UI** with clean CSS
- **Form Validation** for signup and login forms
- **Token Storage** in localStorage
- **Loading Indicators** during API requests
- **Error Handling** with user-friendly messages

## Setup

### Prerequisites
- Node.js (v14+)
- Redis (optional, the app has a fallback mechanism)

### Installation

1. Clone the repository
```
git clone <repository-url>
cd Express-Security-Eg
```

2. Install dependencies
```
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=8080
JWT_SECRET=your_jwt_secret_key
REDIS_URL=redis://localhost:6379
```

### Running the Application

#### Development Mode
To run both the backend and frontend concurrently:
```
npm run dev:all
```

This will start:
- Backend server at http://localhost:8080
- Frontend server at http://localhost:5000

To run only the backend:
```
npm run server
```

To run only the frontend:
```
npm run client
```

#### Production Mode
Build the TypeScript code:
```
npm run build
```

Start the server:
```
npm start
```

## API Endpoints

| Method | Endpoint        | Description                  | Auth Required |
|--------|-----------------|------------------------------|---------------|
| POST   | /api/signup     | Register a new user          | No            |
| POST   | /api/login      | Login and get tokens         | No            |
| POST   | /api/refresh    | Get new tokens               | Yes (refresh) |
| POST   | /api/logout     | Invalidate refresh token     | Yes (any)     |
| GET    | /api/me         | Get user profile             | Yes (access)  |

## Security Features

- **Token-based Authentication**: Using short-lived access tokens and longer-lived refresh tokens
- **Password Hashing**: Secure password storage using bcrypt
- **Rate Limiting**: Prevent brute force attacks with different limits for each endpoint
- **CORS Protection**: Configurable cross-origin resource sharing
- **Validation**: Input validation with detailed error messages
- **Error Handling**: Consistent error responses with appropriate status codes

## Tech Stack

- **Backend**: TypeScript, Express.js, Redis, JWT
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Security**: bcrypt, express-rate-limit, CORS 