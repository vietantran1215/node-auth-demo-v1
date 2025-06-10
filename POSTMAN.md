# Express Security API - Postman Collection

This repository includes a Postman collection for testing the Express Security API with JWT authentication, refresh tokens, and secure logout features.

## Getting Started

### Prerequisites

- [Postman](https://www.postman.com/downloads/) installed on your machine
- Express Security API server running on your local machine (default: http://localhost:8080)

### Importing the Collection and Environment

1. Open Postman
2. Click on "Import" in the top left corner
3. Select the two files:
   - `Express-Security-API.postman_collection.json`
   - `Express-Security-API.postman_environment.json`
4. Click "Import"

### Setting Up the Environment

1. In Postman, click on the environments dropdown in the top right corner
2. Select "Express Security API Environment"
3. Ensure the `baseUrl` variable is set correctly (default: `http://localhost:8080/api`)

## Using the Collection

The collection is organized into two main folders:

### Authentication

Contains individual API endpoints for testing:

- **Sign Up**: Register a new user
- **Login**: Authenticate and obtain tokens
- **Get Profile**: Retrieve user profile data
- **Refresh Token**: Get new tokens using a refresh token
- **Logout (Current Device)**: End the current session
- **Logout (All Devices)**: End all active sessions for the user

### Tests

Contains pre-configured test scenarios:

#### Full Auth Flow

Tests the entire authentication lifecycle:

1. Sign Up
2. Login
3. Get Profile
4. Refresh Token
5. Verify Old Token Invalid
6. Verify New Token Valid
7. Logout
8. Verify Logged Out

To run this flow:

1. Open the "Full Auth Flow" folder
2. Click on the "..." (three dots) next to the folder name
3. Select "Run" to execute all requests in sequence

#### Multi-Device Logout

Tests the logout from multiple devices feature:

1. Login Device 1
2. Login Device 2
3. Verify Device 1 Access
4. Verify Device 2 Access
5. Logout All Devices
6. Verify Device 1 Logged Out
7. Verify Device 2 Logged Out

## Environment Variables

The collection uses several environment variables to manage authentication state:

- `baseUrl`: The base URL for the API
- `accessToken`: The current JWT access token
- `refreshToken`: The current refresh token
- `deviceId`: The current device identifier
- `testUsername`: Used to store a test username between requests
- `device1AccessToken`, `device1RefreshToken`, etc.: Used for multi-device testing

## Security Notes

- The collection includes test scripts that automatically store tokens in environment variables
- Tokens are marked as "secret" type in the environment for better security
- Environment variables are automatically cleared after logout operations
- Be careful when sharing this collection, as it may contain sensitive tokens if exported after testing

## Troubleshooting

- If you encounter 401 errors unexpectedly, your tokens may have expired. Run the Login request again.
- If the server is running on a different port, update the `baseUrl` environment variable.
- Make sure to run the server before executing requests in the collection. 