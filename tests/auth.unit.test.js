const request = require('supertest');
const app = require('../src/app');

// Mock the User model
jest.mock('../src/models/User');
const User = require('../src/models/User');

describe('Auth API - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        password: undefined
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
      expect(res.body.data.user.email).toBe(userData.email);
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        name: userData.name,
        email: userData.email,
        password: userData.password
      }));
    });

    it('should return validation error for missing required fields', async () => {
      User.create.mockRejectedValue(new Error('Nome é obrigatório'));

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'John Doe'
          // missing email and password
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Nome é obrigatório');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        comparePassword: jest.fn().mockResolvedValue(true),
        password: undefined
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
      expect(res.body.data.user.email).toBe(credentials.email);
    });

    it('should return error for invalid credentials', async () => {
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

    it('should return error for missing email or password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'john@example.com'
          // missing password
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Email e senha são obrigatórios');
    });

    it('should return error for non-existent user', async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(credentials)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Credenciais inválidas');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return current user data with valid token', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com'
      };

      User.findById.mockResolvedValue(mockUser);

      // Create a valid token
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: 'user123' }, process.env.JWT_SECRET);

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user._id).toBe(mockUser._id);
      expect(res.body.data.user.email).toBe(mockUser.email);
    });

    it('should return error without token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Acesso negado. Token não fornecido.');
    });

    it('should return error with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Token inválido');
    });

    it('should return error when user not found', async () => {
      User.findById.mockResolvedValue(null);

      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: 'nonexistent' }, process.env.JWT_SECRET);

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Usuário não encontrado');
    });
  });
});