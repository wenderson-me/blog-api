# API Tests

This directory contains comprehensive test suites for the Blog API using **Supertest** and **Jest**.

## Test Files

- `health.test.js` - Tests for the health check endpoint
- `auth.unit.test.js` - Unit tests for authentication endpoints with mocked database
- `api.mocked.test.js` - Comprehensive unit tests with mocked models
- `api.comprehensive.test.js` - Integration tests covering API structure and behavior

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/health.test.js

# Run tests with verbose output
npm test -- --verbose

# Run tests with coverage
npm test -- --coverage
```

## Test Coverage

The test suite covers:

### Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login  
- `GET /api/v1/auth/me` - Get current user (protected)

### Posts Endpoints
- `GET /api/v1/posts` - Get all posts with pagination
- `GET /api/v1/posts/:id` - Get single post
- `POST /api/v1/posts` - Create post (protected)
- `PUT /api/v1/posts/:id` - Update post (protected)
- `DELETE /api/v1/posts/:id` - Delete post (protected)
- `PUT /api/v1/posts/:id/like` - Like/unlike post (protected)
- `POST /api/v1/posts/:id/comments` - Add comment (protected)

### Users Endpoints
- `POST /api/v1/users` - Create user
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Cross-cutting Concerns
- Authentication middleware behavior
- Input validation
- Error handling and response formats
- CORS configuration
- HTTP method support
- Route structure validation

## Test Strategy

The tests use mocked database models to avoid requiring a real MongoDB connection, making them fast and reliable in any environment. The tests focus on:

1. **API Contract Testing** - Ensuring endpoints return correct status codes and response formats
2. **Authentication & Authorization** - Testing protected routes require valid JWT tokens
3. **Input Validation** - Testing required fields and data format validation
4. **Error Handling** - Testing error scenarios and consistent error response formats
5. **API Structure** - Testing route existence and proper HTTP method support

## Mock Strategy

Models are mocked using Jest to simulate database operations without requiring actual database connections. This provides:
- Fast test execution
- Reliable tests that don't depend on external services
- Isolated testing of API logic
- Predictable test data and scenarios