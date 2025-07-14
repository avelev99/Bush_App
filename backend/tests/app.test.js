const request = require('supertest');
const createApp = require('../app');

const app = createApp();

describe('Auth routes', () => {
  test('GET /api/auth/test returns success message', async () => {
    const res = await request(app).get('/api/auth/test');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Backend connection successful!' });
  });

  test('unknown route returns 404', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.statusCode).toBe(404);
  });
});
