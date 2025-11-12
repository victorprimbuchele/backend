import { Router } from 'express';
import { z } from 'zod';
import { ApplicationPrismaRepository } from '../../../infrastructure/repositories/ApplicationPrismaRepository';
import { ApplyForMembership } from '../../../application/membership/ApplyForMembership';
import { createResponse } from '../utils/response';

const bodySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  motivation: z.string().min(5),
});

export const applicationsRouter = Router();

applicationsRouter.post('/', async (req, res, next) => {
  try {
    const parsed = bodySchema.parse(req.body);
    const applicationsRepo = new ApplicationPrismaRepository();
    const usecase = new ApplyForMembership(applicationsRepo);
    const created = await usecase.execute(parsed);
    res.status(201).json(createResponse(created));
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.issues });
    }
    next(err);
  }
});


