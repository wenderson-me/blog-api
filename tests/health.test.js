const request = require('supertest');
const app = require('../src/app');

describe('Health Check API', () => {
  describe('GET /api/v1/health', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(res.body).toEqual({
        success: true,
        message: 'API funcionando!'
      });
    });
  });
});