import request from 'supertest';
import { createApp } from '../../src/interfaces/http/app';
import {
  cleanupDatabase,
  createTestApplication,
  createTestInvite,
  prisma,
} from '../helpers/testHelpers';

describe('POST /register', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  it('deve registrar membro com sucesso usando token do body (caminho feliz)', async () => {
    const app = createApp();
    const application = await createTestApplication({ status: 'APPROVED' });
    const invite = await createTestInvite(application.id, 'valid-token-123');

    const payload = {
      name: 'João Silva',
      email: 'joao@example.com',
      company: 'Tech Corp',
    };

    const res = await request(app).post('/register?token='+invite.token).send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.name).toBe(payload.name);
    expect(res.body.data.email).toBe(payload.email);
    expect(res.body.data.company).toBe(payload.company);
  });

  it('deve registrar membro usando token da query string', async () => {
    const app = createApp();
    const application = await createTestApplication({ status: 'APPROVED' });
    const invite = await createTestInvite(application.id, 'query-token-123');

    const payload = {
      name: 'Maria Santos',
      email: 'maria@example.com',
      company: 'Innovation Labs',
    };

    const res = await request(app)
      .post(`/register?token=${invite.token}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(payload.name);
    expect(res.body.data.email).toBe(payload.email);
  });

  it('deve priorizar token do body sobre query string', async () => {
    const app = createApp();
    const application1 = await createTestApplication({ status: 'APPROVED' });
    const application2 = await createTestApplication({ status: 'APPROVED', email: 'app2@example.com' });
    const validInvite = await createTestInvite(application1.id, 'valid-token');
    const invalidInvite = await createTestInvite(application2.id, 'invalid-token');

    const payload = {
      token: validInvite.token,
      name: 'Pedro Oliveira',
      email: 'pedro@example.com',
    };

    const res = await request(app)
      .post(`/register?token=${invalidInvite.token}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(payload.name);
  });

  it('deve registrar membro sem company (opcional)', async () => {
    const app = createApp();
    const application = await createTestApplication({ status: 'APPROVED' });
    const invite = await createTestInvite(application.id, 'token-no-company');

    const payload = {
      token: invite.token,
      name: 'Ana Costa',
      email: 'ana@example.com',
    };

    const res = await request(app).post('/register').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(payload.name);
    expect(res.body.data.company).toBeNull();
  });

  it('deve barrar quando token está faltando', async () => {
    const app = createApp();

    const payload = {
      name: 'João Silva',
      email: 'joao@example.com',
    };

    const res = await request(app).post('/register').send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Token is required (provide in body or query string)');
  });

  it('deve barrar quando token é inválido', async () => {
    const app = createApp();

    const payload = {
      token: 'invalid-token',
      name: 'João Silva',
      email: 'joao@example.com',
    };

    const res = await request(app).post('/register').send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid invite token');
  });

  it('deve barrar quando token já foi usado', async () => {
    const app = createApp();
    const application = await createTestApplication({ status: 'APPROVED' });
    const invite = await createTestInvite(application.id, 'used-token');
    
    // Marcar como usado
    await prisma.invite.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    });

    const payload = {
      token: invite.token,
      name: 'João Silva',
      email: 'joao@example.com',
    };

    const res = await request(app).post('/register').send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invite already used');
  });

  it('deve barrar quando token está expirado', async () => {
    const app = createApp();
    const application = await createTestApplication({ status: 'APPROVED' });
    
    // Criar invite expirado
    const expiredInvite = await prisma.invite.create({
      data: {
        applicationId: application.id,
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
      },
    });

    const payload = {
      token: expiredInvite.token,
      name: 'João Silva',
      email: 'joao@example.com',
    };

    const res = await request(app).post('/register').send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invite expired');
  });

  it('deve barrar quando name é muito curto', async () => {
    const app = createApp();
    const application = await createTestApplication({ status: 'APPROVED' });
    const invite = await createTestInvite(application.id, 'token-short-name');

    const payload = {
      token: invite.token,
      name: 'A', // Mínimo é 2
      email: 'joao@example.com',
    };

    const res = await request(app).post('/register').send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation error');
  });

  it('deve barrar quando email é inválido', async () => {
    const app = createApp();
    const application = await createTestApplication({ status: 'APPROVED' });
    const invite = await createTestInvite(application.id, 'token-invalid-email');

    const payload = {
      token: invite.token,
      name: 'João Silva',
      email: 'email-invalido',
    };

    const res = await request(app).post('/register').send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation error');
  });

  it('deve barrar quando campos obrigatórios estão faltando', async () => {
    const app = createApp();
    const application = await createTestApplication({ status: 'APPROVED' });
    const invite = await createTestInvite(application.id, 'token-missing-fields');

    const payload = {
      token: invite.token,
      name: 'João Silva',
      // email faltando
    };

    const res = await request(app).post('/register').send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation error');
  });
});

