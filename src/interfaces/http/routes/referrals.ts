import { Router } from 'express';
import { z } from 'zod';
import { ReferralPrismaRepository } from '../../../infrastructure/repositories/ReferralPrismaRepository';
import { CreateReferral } from '../../../application/referrals/CreateReferral';
import { ListReferralsForMember } from '../../../application/referrals/ListReferralsForMember';
import { UpdateReferralStatus } from '../../../application/referrals/UpdateReferralStatus';
import { createPaginatedResponse, createResponse } from '../utils/response';

function getMemberIdFromHeader(req: any): string | null {
  const id = req.header('X-MEMBER-ID');
  return id ?? null;
}

export const referralsRouter = Router();

const createSchema = z.object({
  toMemberId: z.string().min(1),
  companyOrContact: z.string().min(1),
  description: z.string().min(1),
});

referralsRouter.post('/referrals', async (req, res, next) => {
  try {
    const fromMemberId = getMemberIdFromHeader(req);
    if (!fromMemberId) return res.status(401).json({ error: 'Missing X-MEMBER-ID' });
    const parsed = createSchema.parse(req.body);
    const repo = new ReferralPrismaRepository();
    const created = await new CreateReferral(repo).execute({
      fromMemberId,
      toMemberId: parsed.toMemberId,
      companyOrContact: parsed.companyOrContact,
      description: parsed.description,
    });
    res.status(201).json(createResponse(created));
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.issues });
    }
    next(err);
  }
});

const querySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
});

referralsRouter.get('/referrals', async (req, res, next) => {
  try {
    const memberId = getMemberIdFromHeader(req);
    if (!memberId) return res.status(401).json({ error: 'Missing X-MEMBER-ID' });
    const { page, limit } = querySchema.parse(req.query);
    const repo = new ReferralPrismaRepository();
    const result = await new ListReferralsForMember(repo).execute(memberId, { page, limit });
    
    const mineResponse = createPaginatedResponse(result.mine.data, page, limit, result.mine.total);
    const toMeResponse = createPaginatedResponse(result.toMe.data, page, limit, result.toMe.total);
    
    res.json({
      data: {
        mine: mineResponse.data,
        toMe: toMeResponse.data,
      },
      meta: {
        mine: mineResponse.meta,
        toMe: toMeResponse.meta,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.issues });
    }
    next(err);
  }
});

const updateSchema = z.object({
  status: z.enum(['NEW', 'IN_CONTACT', 'CLOSED', 'DECLINED']),
});

referralsRouter.patch('/referrals/:id', async (req, res, next) => {
  try {
    const memberId = getMemberIdFromHeader(req);
    if (!memberId) return res.status(401).json({ error: 'Missing X-MEMBER-ID' });
    const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
    const { status } = updateSchema.parse(req.body);
    const repo = new ReferralPrismaRepository();
    await new UpdateReferralStatus(repo).execute(id, status);
    res.json(createResponse({ id, status }));
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.issues });
    }
    next(err);
  }
});


