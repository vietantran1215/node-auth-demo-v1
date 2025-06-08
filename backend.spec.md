# Technical specification

## Tech stack
- Programming language: TypeScript
- Framework: ExpressJS
- Data storage: hardcoded array with mock data
- Cache: Redis
- Security: cors, dotenv, jsonwebtoken

## API Endpoint
| Method | Endpoint            | Description                   | Auth Required         |
| ------ | ------------------- | ----------------------------- | --------------------- |
| POST   | `/api/signup`       | Register a new user           | ❌                     |
| POST   | `/api/login`        | Login, return tokens          | ❌                     |
| POST   | `/api/refresh`      | Issue new tokens from refresh | ❌                     |
| POST   | `/api/logout`       | Invalidate refresh token      | ✅ (access or refresh) |
| GET    | `/api/me`           | Get user profile              | ✅ (access)            |

## Token Strategy
| Token         | Stored At     | Expiry  | Used For                  |
| ------------- | ------------- | ------- | ------------------------- |
| Access Token  | HTTP Header   | 15 mins | Authenticate API requests |
| Refresh Token | Redis (or DB) | 7 days  | Get new access token      |
