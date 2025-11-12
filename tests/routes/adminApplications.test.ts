import request from 'supertest';
import { createApp } from '../../src/interfaces/http/app';
import {
  createTestApplication,
  getAdminHeaders,
  ADMIN_KEY,
  cleanupDatabase,
} from '../helpers/testHelpers';

// Mock da variável de ambiente
const originalEnv = process.env.ADMIN_KEY;

describe('GET /admin/applications', () => {
  beforeAll(() => {
    process.env.ADMIN_KEY = ADMIN_KEY;
  });

  afterAll(() => {
    process.env.ADMIN_KEY = originalEnv;
  });

  beforeEach(async () => {
    await cleanupDatabase();
  });

  it('deve listar aplicações com paginação (caminho feliz)', async () => {
    const app = createApp();
    
    // Criar 15 aplicações
    for (let i = 0; i < 15; i++) {
      await createTestApplication({
        name: `Applicant ${i}`,
        email: `applicant${i}@example.com`,
      });
    }

    const res = await request(app)
      .get('/admin/applications')
      .set(getAdminHeaders());

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(10); // Default limit
    expect(res.body.meta).toEqual({
      page: 1,
      limit: 10,
      total: 15,
      totalPages: 2,
    });
  });

  it('deve respeitar parâmetros de paginação', async () => {
    const app = createApp();
    
    // Criar 25 aplicações
    for (let i = 0; i < 25; i++) {
      await createTestApplication({
        name: `Applicant ${i}`,
        email: `applicant${i}@example.com`,
      });
    }

    const res = await request(app)
      .get('/admin/applications?page=2&limit=5')
      .set(getAdminHeaders());

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(5);
    expect(res.body.meta).toEqual({
      page: 2,
      limit: 5,
      total: 25,
      totalPages: 5,
    });
  });

  it('deve retornar array vazio quando não há aplicações', async () => {
    const app = createApp();

    const res = await request(app)
      .get('/admin/applications')
      .set(getAdminHeaders());

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta).toEqual({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });
  });

  it('deve barrar quando não há X-ADMIN-KEY', async () => {
    const app = createApp();

    const res = await request(app).get('/admin/applications');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Unauthorized');
  });

  it('deve barrar quando X-ADMIN-KEY está incorreto', async () => {
    const app = createApp();

    const res = await request(app)
      .get('/admin/applications')
      .set({ 'X-ADMIN-KEY': 'wrong-key' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Unauthorized');
  });
});

describe('POST /admin/applications/:id/approve', () => {
  beforeAll(() => {
    process.env.ADMIN_KEY = ADMIN_KEY;
  });

  afterAll(() => {
    process.env.ADMIN_KEY = originalEnv;
  });

  beforeEach(async () => {
    await cleanupDatabase();
  });

  it('deve aprovar aplicação com sucesso (caminho feliz)', async () => {
    const app = createApp();
    const application = await createTestApplication({
      status: 'PENDING',
    });

    const res = await request(app)
      .post(`/admin/applications/${application.id}/approve`)
      .set(getAdminHeaders());

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('message', 'Approved');
    expect(res.body.data).toHaveProperty('invite');
    expect(res.body.data.invite).toHaveProperty('token');
    expect(res.body.data.invite).toHaveProperty('inviteUrl');
  });

  it('deve barrar quando aplicação não existe', async () => {
    const app = createApp();
    const fakeId = 'non-existent-id';

    const res = await request(app)
      .post(`/admin/applications/${fakeId}/approve`)
      .set(getAdminHeaders());

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('deve barrar quando não há X-ADMIN-KEY', async () => {
    const app = createApp();
    const application = await createTestApplication();

    const res = await request(app)
      .post(`/admin/applications/${application.id}/approve`);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Unauthorized');
  });

  it('deve barrar quando id é vazio', async () => {
    const app = createApp();

    const res = await request(app)
      .post('/admin/applications//approve')
      .set(getAdminHeaders());

    expect(res.status).toBe(404); // Express retorna 404 para rota não encontrada
  });
});

describe('POST /admin/applications/:id/reject', () => {
  beforeAll(() => {
    process.env.ADMIN_KEY = ADMIN_KEY;
  });

  afterAll(() => {
    process.env.ADMIN_KEY = originalEnv;
  });

  beforeEach(async () => {
    await cleanupDatabase();
  });

  it('deve rejeitar aplicação com sucesso (caminho feliz)', async () => {
    const app = createApp();
    const application = await createTestApplication({
      status: 'PENDING',
    });

    const res = await request(app)
      .post(`/admin/applications/${application.id}/reject`)
      .set(getAdminHeaders());

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('message', 'Rejected');
  });

  it('deve barrar quando aplicação não existe', async () => {
    const app = createApp();
    const fakeId = 'non-existent-id';

    const res = await request(app)
      .post(`/admin/applications/${fakeId}/reject`)
      .set(getAdminHeaders());

    expect(res.status).toBe(404); // RejectApplication valida existência e retorna 404
    expect(res.body).toHaveProperty('error', 'Application not found');
  });

  it('deve barrar quando não há X-ADMIN-KEY', async () => {
    const app = createApp();
    const application = await createTestApplication();

    const res = await request(app)
      .post(`/admin/applications/${application.id}/reject`);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Unauthorized');
  });
});

