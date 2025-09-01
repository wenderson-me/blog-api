// Test environment setup
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
  process.env.JWT_EXPIRE = '7d';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/blog-test';
});