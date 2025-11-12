import request from 'supertest';
import { createApp } from '../../src/interfaces/http/app';
import { cleanupDatabase } from '../helpers/testHelpers';

describe('POST /applications', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  it('deve criar uma aplicação com sucesso (caminho feliz)', async () => {
    const app = createApp();
    const payload = {
      name: 'João Silva',
      email: 'joao@example.com',
      company: 'Tech Corp',
      motivation: 'Quero fazer parte da comunidade e contribuir com minha experiência.',
    };

    const res = await request(app).post('/applications').send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.name).toBe(payload.name);
    expect(res.body.data.email).toBe(payload.email);
    expect(res.body.data.company).toBe(payload.company);
    expect(res.body.data.motivation).toBe(payload.motivation);
    expect(res.body.data.status).toBe('PENDING');
  });

  it('deve criar aplicação sem company (opcional)', async () => {
    const app = createApp();
    const payload = {
      name: 'Maria Santos',
      email: 'maria@example.com',
      motivation: 'Motivação suficiente para ser aceita.',
    };

    const res = await request(app).post('/applications').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(payload.name);
    expect(res.body.data.email).toBe(payload.email);
    expect(res.body.data.company).toBeNull();
  });

  it('deve barrar quando name é muito curto', async () => {
    const app = createApp();
    const payload = {
      name: 'A', // Mínimo é 2
      email: 'test@example.com',
      motivation: 'Motivação suficiente.',
    };

    const res = await request(app).post('/applications').send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation error');
    expect(res.body).toHaveProperty('details');
  });

  it('deve barrar quando email é inválido', async () => {
    const app = createApp();
    const payload = {
      name: 'João Silva',
      email: 'email-invalido',
      motivation: 'Motivação suficiente.',
    };

    const res = await request(app).post('/applications').send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation error');
  });

  it('deve barrar quando motivation é muito curta', async () => {
    const app = createApp();
    const payload = {
      name: 'João Silva',
      email: 'joao@example.com',
      motivation: '1234', // Mínimo é 5
    };

    const res = await request(app).post('/applications').send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation error');
  });

  it('deve barrar quando campos obrigatórios estão faltando', async () => {
    const app = createApp();
    const payload = {
      name: 'João Silva',
      // email faltando
      motivation: 'Motivação suficiente.',
    };

    const res = await request(app).post('/applications').send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation error');
  });
});

