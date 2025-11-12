import request from 'supertest';
import { createApp } from '../src/interfaces/http/app';

describe('health endpoint', () => {
  it('GET /health returns ok', async () => {
    const app = createApp();
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});


