const request = require('supertest');
const app = require('../src/app');

describe('Blog API - Endpoint Tests', () => {
  
  describe('Application Health', () => {
    it('should return API health status', async () => {
      const res = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(res.body).toEqual({
        success: true,
        message: 'API funcionando!'
      });
    });
  });

  describe('Route Structure Validation', () => {
    it('should handle authentication routes', async () => {
      // Test register endpoint structure
      const registerRes = await request(app)
        .post('/api/v1/auth/register')
        .send({});
      
      expect(registerRes.status).not.toBe(404); // Route exists
      expect(registerRes.body).toHaveProperty('success');

      // Test login endpoint structure
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({});
      
      expect(loginRes.status).not.toBe(404);
      expect(loginRes.body).toHaveProperty('success');
    });

    it('should handle protected auth route', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .expect(401); // Should require authentication

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Acesso negado. Token não fornecido.');
    });

    it('should return 404 for non-existent routes', async () => {
      const res = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('não encontrada');
    });
  });

  describe('Input Validation', () => {
    it('should validate required fields on login', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com'
          // missing password
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Email e senha são obrigatórios');
    });

    it('should handle malformed JSON gracefully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect([400, 500]).toContain(res.status);
    });

    it('should validate ObjectId format', async () => {
      const res = await request(app)
        .get('/api/v1/posts/invalid-id')
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('Authentication Middleware', () => {
    it('should protect post creation endpoint', async () => {
      const postData = {
        title: 'New Post',
        content: 'Content',
        category: 'Technology'
      };

      const res = await request(app)
        .post('/api/v1/posts')
        .send(postData)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Acesso negado. Token não fornecido.');
    });

    it('should protect post like endpoint', async () => {
      const res = await request(app)
        .put('/api/v1/posts/507f1f77bcf86cd799439011/like')
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should protect comment endpoint', async () => {
      const res = await request(app)
        .post('/api/v1/posts/507f1f77bcf86cd799439011/comments')
        .send({ content: 'Test comment' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should reject invalid JWT tokens', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Token inválido');
    });

    it('should reject malformed authorization headers', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Acesso negado. Token não fornecido.');
    });
  });

  describe('HTTP Methods Support', () => {
    it('should support GET for public endpoints', async () => {
      const res = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should support POST for auth endpoints', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({});

      expect([400, 401, 500]).toContain(res.status);
      expect(res.body).toHaveProperty('success');
    });

    it('should support PUT for update operations (auth required)', async () => {
      const res = await request(app)
        .put('/api/v1/posts/507f1f77bcf86cd799439011/like')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('Content-Type Handling', () => {
    it('should return JSON responses', async () => {
      const res = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(res.type).toBe('application/json');
      expect(res.body).toBeInstanceOf(Object);
    });
  });

  describe('CORS Configuration', () => {
    it('should include CORS headers', async () => {
      const res = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(res.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should handle preflight OPTIONS requests', async () => {
      const res = await request(app)
        .options('/api/v1/health');

      expect([200, 204]).toContain(res.status);
    });
  });

  describe('Error Response Format', () => {
    it('should return consistent error format for 404', async () => {
      const res = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);

      expect(res.body).toEqual({
        success: false,
        message: expect.stringContaining('não encontrada')
      });
    });

    it('should return consistent error format for auth failures', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(res.body).toEqual({
        success: false,
        message: 'Acesso negado. Token não fornecido.'
      });
    });

    it('should return consistent error format for validation failures', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com' }) // missing password
        .expect(400);

      expect(res.body).toEqual({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    });
  });
});