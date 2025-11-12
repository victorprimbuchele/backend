import request from 'supertest';
import { createApp } from '../../src/interfaces/http/app';
import {
  cleanupDatabase,
  createTestMember,
  createTestReferral,
  getMemberHeaders,
} from '../helpers/testHelpers';

describe('GET /referrals', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  it('deve listar referrals com paginação (caminho feliz)', async () => {
    const app = createApp();
    const member = await createTestMember();
    const otherMember = await createTestMember({ email: 'other@example.com' });

    // Criar 15 referrals onde member é o remetente
    for (let i = 0; i < 15; i++) {
      await createTestReferral({
        fromMemberId: member.id,
        toMemberId: otherMember.id,
        companyOrContact: `Company ${i}`,
      });
    }

    // Criar 12 referrals onde member é o destinatário
    for (let i = 0; i < 12; i++) {
      await createTestReferral({
        fromMemberId: otherMember.id,
        toMemberId: member.id,
        companyOrContact: `Contact ${i}`,
      });
    }

    const res = await request(app)
      .get('/referrals')
      .set(getMemberHeaders(member.id));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
    expect(res.body.data).toHaveProperty('mine');
    expect(res.body.data).toHaveProperty('toMe');
    expect(Array.isArray(res.body.data.mine)).toBe(true);
    expect(Array.isArray(res.body.data.toMe)).toBe(true);
    expect(res.body.meta.mine).toEqual({
      page: 1,
      limit: 10,
      total: 15,
      totalPages: 2,
    });
    expect(res.body.meta.toMe).toEqual({
      page: 1,
      limit: 10,
      total: 12,
      totalPages: 2,
    });
  });

  it('deve respeitar parâmetros de paginação', async () => {
    const app = createApp();
    const member = await createTestMember();
    const otherMember = await createTestMember({ email: 'other@example.com' });

    // Criar 20 referrals
    for (let i = 0; i < 20; i++) {
      await createTestReferral({
        fromMemberId: member.id,
        toMemberId: otherMember.id,
      });
    }

    const res = await request(app)
      .get('/referrals?page=2&limit=5')
      .set(getMemberHeaders(member.id));

    expect(res.status).toBe(200);
    expect(res.body.data.mine.length).toBe(5);
    expect(res.body.meta.mine).toEqual({
      page: 2,
      limit: 5,
      total: 20,
      totalPages: 4,
    });
  });

  it('deve retornar arrays vazios quando não há referrals', async () => {
    const app = createApp();
    const member = await createTestMember();

    const res = await request(app)
      .get('/referrals')
      .set(getMemberHeaders(member.id));

    expect(res.status).toBe(200);
    expect(res.body.data.mine).toEqual([]);
    expect(res.body.data.toMe).toEqual([]);
    expect(res.body.meta.mine.total).toBe(0);
    expect(res.body.meta.toMe.total).toBe(0);
  });

  it('deve barrar quando não há X-MEMBER-ID', async () => {
    const app = createApp();

    const res = await request(app).get('/referrals');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Missing X-MEMBER-ID');
  });
});

describe('POST /referrals', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  it('deve criar referral com sucesso (caminho feliz)', async () => {
    const app = createApp();
    const fromMember = await createTestMember();
    const toMember = await createTestMember({ email: 'to@example.com' });

    const payload = {
      toMemberId: toMember.id,
      companyOrContact: 'Google',
      description: 'Oportunidade interessante na Google.',
    };

    const res = await request(app)
      .post('/referrals')
      .set(getMemberHeaders(fromMember.id))
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.fromMemberId).toBe(fromMember.id);
    expect(res.body.data.toMemberId).toBe(toMember.id);
    expect(res.body.data.companyOrContact).toBe(payload.companyOrContact);
    expect(res.body.data.description).toBe(payload.description);
    expect(res.body.data.status).toBe('NEW');
  });

  it('deve barrar quando não há X-MEMBER-ID', async () => {
    const app = createApp();
    const toMember = await createTestMember();

    const payload = {
      toMemberId: toMember.id,
      companyOrContact: 'Google',
      description: 'Oportunidade interessante.',
    };

    const res = await request(app).post('/referrals').send(payload);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Missing X-MEMBER-ID');
  });

  it('deve barrar quando toMemberId está faltando', async () => {
    const app = createApp();
    const fromMember = await createTestMember();

    const payload = {
      companyOrContact: 'Google',
      description: 'Oportunidade interessante.',
    };

    const res = await request(app)
      .post('/referrals')
      .set(getMemberHeaders(fromMember.id))
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation error');
  });

  it('deve barrar quando companyOrContact está faltando', async () => {
    const app = createApp();
    const fromMember = await createTestMember();
    const toMember = await createTestMember({ email: 'to@example.com' });

    const payload = {
      toMemberId: toMember.id,
      description: 'Oportunidade interessante.',
    };

    const res = await request(app)
      .post('/referrals')
      .set(getMemberHeaders(fromMember.id))
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation error');
  });

  it('deve barrar quando description está faltando', async () => {
    const app = createApp();
    const fromMember = await createTestMember();
    const toMember = await createTestMember({ email: 'to@example.com' });

    const payload = {
      toMemberId: toMember.id,
      companyOrContact: 'Google',
    };

    const res = await request(app)
      .post('/referrals')
      .set(getMemberHeaders(fromMember.id))
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation error');
  });
});

describe('PATCH /referrals/:id', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  it('deve atualizar status do referral com sucesso (caminho feliz)', async () => {
    const app = createApp();
    const fromMember = await createTestMember();
    const toMember = await createTestMember({ email: 'to@example.com' });
    const referral = await createTestReferral({
      fromMemberId: fromMember.id,
      toMemberId: toMember.id,
      status: 'NEW',
    });

    const payload = {
      status: 'IN_CONTACT',
    };

    const res = await request(app)
      .patch(`/referrals/${referral.id}`)
      .set(getMemberHeaders(fromMember.id))
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('id', referral.id);
    expect(res.body.data).toHaveProperty('status', 'IN_CONTACT');
  });

  it('deve barrar quando não há X-MEMBER-ID', async () => {
    const app = createApp();
    const fromMember = await createTestMember();
    const toMember = await createTestMember({ email: 'to@example.com' });
    const referral = await createTestReferral({
      fromMemberId: fromMember.id,
      toMemberId: toMember.id,
    });

    const payload = {
      status: 'IN_CONTACT',
    };

    const res = await request(app)
      .patch(`/referrals/${referral.id}`)
      .send(payload);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Missing X-MEMBER-ID');
  });

  it('deve barrar quando status é inválido', async () => {
    const app = createApp();
    const fromMember = await createTestMember();
    const toMember = await createTestMember({ email: 'to@example.com' });
    const referral = await createTestReferral({
      fromMemberId: fromMember.id,
      toMemberId: toMember.id,
    });

    const payload = {
      status: 'INVALID_STATUS',
    };

    const res = await request(app)
      .patch(`/referrals/${referral.id}`)
      .set(getMemberHeaders(fromMember.id))
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation error');
  });

  it('deve barrar quando status está faltando', async () => {
    const app = createApp();
    const fromMember = await createTestMember();
    const toMember = await createTestMember({ email: 'to@example.com' });
    const referral = await createTestReferral({
      fromMemberId: fromMember.id,
      toMemberId: toMember.id,
    });

    const payload = {};

    const res = await request(app)
      .patch(`/referrals/${referral.id}`)
      .set(getMemberHeaders(fromMember.id))
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation error');
  });

  it('deve barrar quando id é inválido (não existe no banco)', async () => {
    const app = createApp();
    const fromMember = await createTestMember();

    const payload = {
      status: 'IN_CONTACT',
    };

    const res = await request(app)
      .patch('/referrals/invalid-id-12345')
      .set(getMemberHeaders(fromMember.id))
      .send(payload);

    // O ID passa na validação do Zod, mas falha no banco
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

