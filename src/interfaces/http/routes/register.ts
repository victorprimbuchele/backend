import { Router } from 'express';
import { z } from 'zod';
import { RegisterMemberWithInvite } from '../../../application/membership/RegisterMemberWithInvite';
import { InvitePrismaRepository } from '../../../infrastructure/repositories/InvitePrismaRepository';
import { MemberPrismaRepository } from '../../../infrastructure/repositories/MemberPrismaRepository';
import { createResponse } from '../utils/response';

const bodySchema = z.object({
  token: z.string().min(1).optional(),
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
});

export const registerRouter = Router();

registerRouter.post('/register', async (req, res, next) => {
  try {
    // Aceita token da query string ou do body (prioridade para o body)
    const tokenFromQuery = req.query.token as string | undefined;
    const parsed = bodySchema.parse(req.body);
    const token = (parsed.token && parsed.token.length > 0) ? parsed.token : tokenFromQuery;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required (provide in body or query string)' });
    }

    const usecase = new RegisterMemberWithInvite(new InvitePrismaRepository(), new MemberPrismaRepository());
    const created = await usecase.execute(token, {
      name: parsed.name,
      email: parsed.email,
      company: parsed.company,
    });
    res.status(201).json(createResponse(created));
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.issues });
    }
    next(err);
  }
});


