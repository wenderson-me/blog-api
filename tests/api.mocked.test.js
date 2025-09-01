const request = require('supertest');

// Mock the models before importing the app
jest.mock('../src/models/User');
jest.mock('../src/models/Post');

const app = require('../src/app');
const User = require('../src/models/User');
const Post = require('../src/models/Post');

describe('API Mocked Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Auth Controller Tests', () => {
    describe('POST /api/v1/auth/register', () => {
      it('should register user successfully', async () => {
        const mockUser = {
          _id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user'
        };

        User.create.mockResolvedValue(mockUser);

        const userData = {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        };

        const res = await request(app)
          .post('/api/v1/auth/register')
          .send(userData)
          .expect(201);

        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeDefined();
        expect(res.body.data.user.name).toBe(userData.name);
      });

      it('should handle registration errors', async () => {
        User.create.mockRejectedValue(new Error('Email já está em uso'));

        const userData = {
          name: 'John Doe',
          email: 'duplicate@example.com',
          password: 'password123'
        };

        const res = await request(app)
          .post('/api/v1/auth/register')
          .send(userData)
          .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Email já está em uso');
      });
    });

    describe('POST /api/v1/auth/login', () => {
      it('should login with valid credentials', async () => {
        const mockUser = {
          _id: '507f1f77bcf86cd799439011',
          email: 'john@example.com',
          comparePassword: jest.fn().mockResolvedValue(true)
        };

        User.findOne.mockReturnValue({
          select: jest.fn().mockResolvedValue(mockUser)
        });

        const credentials = {
          email: 'john@example.com',
          password: 'password123'
        };

        const res = await request(app)
          .post('/api/v1/auth/login')
          .send(credentials)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeDefined();
      });

      it('should reject invalid credentials', async () => {
        const mockUser = {
          comparePassword: jest.fn().mockResolvedValue(false)
        };

        User.findOne.mockReturnValue({
          select: jest.fn().mockResolvedValue(mockUser)
        });

        const credentials = {
          email: 'john@example.com',
          password: 'wrongpassword'
        };

        const res = await request(app)
          .post('/api/v1/auth/login')
          .send(credentials)
          .expect(401);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Credenciais inválidas');
      });
    });
  });

  describe('Posts Controller Tests', () => {
    describe('GET /api/v1/posts', () => {
      it('should return posts with pagination', async () => {
        const mockPosts = [
          { _id: '507f1f77bcf86cd799439011', title: 'Post 1' },
          { _id: '507f1f77bcf86cd799439012', title: 'Post 2' }
        ];

        const mockQuery = {
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue(mockPosts)
        };

        Post.find.mockReturnValue(mockQuery);
        Post.countDocuments.mockResolvedValue(2);

        const res = await request(app)
          .get('/api/v1/posts')
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(2);
        expect(res.body.total).toBe(2);
      });

      it('should handle database errors', async () => {
        Post.find.mockImplementation(() => {
          throw new Error('Database error');
        });

        const res = await request(app)
          .get('/api/v1/posts')
          .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Database error');
      });
    });

    describe('Protected Routes', () => {
      it('should require authentication for creating posts', async () => {
        const postData = {
          title: 'New Post',
          content: 'Content',
          category: 'Tech'
        };

        const res = await request(app)
          .post('/api/v1/posts')
          .send(postData)
          .expect(401);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Acesso negado. Token não fornecido.');
      });

      it('should require authentication for liking posts', async () => {
        const res = await request(app)
          .put('/api/v1/posts/507f1f77bcf86cd799439011/like')
          .expect(401);

        expect(res.body.success).toBe(false);
      });

      it('should require authentication for commenting', async () => {
        const res = await request(app)
          .post('/api/v1/posts/507f1f77bcf86cd799439011/comments')
          .send({ content: 'Nice post!' })
          .expect(401);

        expect(res.body.success).toBe(false);
      });
    });
  });

  describe('Users Controller Tests', () => {
    describe('POST /api/v1/users', () => {
      it('should create user successfully', async () => {
        const mockUser = {
          _id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com'
        };

        User.create.mockResolvedValue(mockUser);

        const userData = {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        };

        const res = await request(app)
          .post('/api/v1/users')
          .send(userData)
          .expect(201);

        expect(res.body.success).toBe(true);
        expect(res.body.user.name).toBe(userData.name);
      });

      it('should handle validation errors', async () => {
        User.create.mockRejectedValue(new Error('Validation failed'));

        const res = await request(app)
          .post('/api/v1/users')
          .send({ name: 'John' })
          .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Validation failed');
      });
    });

    describe('GET /api/v1/users/:id', () => {
      it('should get user by ID', async () => {
        const mockUser = {
          _id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com'
        };

        User.findById.mockReturnValue({
          select: jest.fn().mockResolvedValue(mockUser)
        });

        const res = await request(app)
          .get('/api/v1/users/507f1f77bcf86cd799439011')
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.user.name).toBe(mockUser.name);
      });

      it('should return 404 for non-existent user', async () => {
        User.findById.mockReturnValue({
          select: jest.fn().mockResolvedValue(null)
        });

        const res = await request(app)
          .get('/api/v1/users/507f1f77bcf86cd799439011')
          .expect(404);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Usuário não encontrado');
      });
    });
  });

  describe('API Structure Tests', () => {
    it('should have correct health endpoint', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should have authentication endpoints', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({});
      
      // Should not be 404 (route exists)
      expect(loginRes.status).not.toBe(404);
      expect(loginRes.body).toHaveProperty('success');
    });

    it('should return proper error for non-existent routes', async () => {
      const res = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('não encontrada');
    });
  });
});