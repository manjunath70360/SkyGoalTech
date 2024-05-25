# Auth API with SQLite, Express, and JWT

This project is a simple authentication API built with Node.js, Express, SQLite, and JWT for token-based authentication.

## Features

- User Sign Up
- User Login
- Protected Routes
- JWT Authentication

## Prerequisites

- Node.js (v12 or higher)
- npm (v6 or higher)

## Setup

1. **Clone the repository**:
    ```sh
    git clone https://github.com/your-username/auth-api-example.git
    cd auth-api-example
    ```

2. **Install dependencies**:
    ```sh
    npm install
    ```

3. **Create a `.env` file** in the root directory and add the following environment variables:
    ```
    PORT=8050
    JWT_SECRET=your_secret_key
    ```

4. **Start the server**:
    ```sh
    node server.js
    ```

## API Endpoints

### Sign Up

- **Endpoint**: `/newuser`
- **Method**: `POST`
- **Description**: Create a new user.
- **Request Body**:
    ```json
    {
      "username": "testuser",
      "password": "password123",
      "phoneNo": "1234567890",
      "address": "123 Test Street"
    }
    ```
- **Response**:
    - Success:
        ```json
        { "message": "Created new user with id {newUserId}" }
        ```
    - Error:
        ```json
        { "message": "User already exists" }
        ```

### Login

- **Endpoint**: `/login`
- **Method**: `POST`
- **Description**: Log in an existing user.
- **Request Body**:
    ```json
    {
      "username": "testuser",
      "password": "password123"
    }
    ```
- **Response**:
    - Success:
        ```json
        { "jwtToken": "your_jwt_token", "message": "Logged In" }
        ```
    - Error:
        ```json
        { "message": "Invalid user" }
        ```
        ```json
        { "message": "Invalid Password" }
        ```

### Get User Details

- **Endpoint**: `/user`
- **Method**: `GET`
- **Description**: Get details of the logged-in user.
- **Headers**:
    ```json
    {
      "Authorization": "Bearer your_jwt_token"
    }
    ```
- **Response**:
    - Success:
        ```json
        {
          "username": "testuser",
          "phoneNum": "1234567890",
          "address": "123 Test Street"
        }
        ```
    - Error:
        ```json
        { "message": "User not found" }
        ```
        ```json
        { "message": "Token is not valid" }
        ```

## Testing the API

You can use tools like Postman or curl to test the API endpoints. Below are examples of how to test each endpoint using curl.

### Sign Up

```sh
curl -X POST http://localhost:8050/newuser \
     -H "Content-Type: application/json" \
     -d '{
           "username": "testuser",
           "password": "password123",
           "phoneNo": "1234567890",
           "address": "123 Test Street"
         }'
```

### Login

```sh
curl -X POST http://localhost:8050/login \
     -H "Content-Type: application/json" \
     -d '{
           "username": "testuser",
           "password": "password123"
         }'
```

### Get User Details

First, log in to get the JWT token. Then use the token to access the protected route.

```sh
curl -X GET http://localhost:8050/user \
     -H "Authorization: Bearer your_jwt_token"
```

Replace `your_jwt_token` with the token you received from the login response.

## Notes

- Ensure your `.env` file is correctly set up with a `JWT_SECRET` value.
- The JWT token expires in 1 hour by default. You can adjust this in the `jwt.sign` function options.

---

This README should help you set up and test the backend authentication API effectively.
