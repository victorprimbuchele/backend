import { Router } from 'express';
import { z } from 'zod';
import { adminAuth } from '../middleware/adminAuth';
import { ApplicationPrismaRepository } from '../../../infrastructure/repositories/ApplicationPrismaRepository';
import { ApproveApplication } from '../../../application/membership/ApproveApplication';
import { RejectApplication } from '../../../application/membership/RejectApplication';
import { createPaginatedResponse, createResponse } from '../utils/response';

export const adminApplicationsRouter = Router();
adminApplicationsRouter.use(adminAuth);

const querySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
});

adminApplicationsRouter.get('/', async (req, res, next) => {
  try {
    const { page, limit } = querySchema.parse(req.query);
    const applicationsRepo = new ApplicationPrismaRepository();
    const result = await applicationsRepo.listAll({ page, limit });
    const response = createPaginatedResponse(result.data, page, limit, result.total);
    res.json(response);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.issues });
    }
    next(err);
  }
});

const paramsSchema = z.object({ id: z.string().min(1) });

adminApplicationsRouter.post('/:id/approve', async (req, res, next) => {
  try {
    const { id } = paramsSchema.parse(req.params);
    const applicationsRepo = new ApplicationPrismaRepository();
    const approve = new ApproveApplication(applicationsRepo, new (await import('../../../infrastructure/repositories/InvitePrismaRepository')).InvitePrismaRepository());
    const result = await approve.execute(id);
    // Simula envio de email: retorna o link
    res.json(createResponse({ message: 'Approved', invite: result }));
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.issues });
    }
    next(err);
  }
});

adminApplicationsRouter.post('/:id/reject', async (req, res, next) => {
  try {
    const { id } = paramsSchema.parse(req.params);
    const applicationsRepo = new ApplicationPrismaRepository();
    const reject = new RejectApplication(applicationsRepo);
    await reject.execute(id);
    res.json(createResponse({ message: 'Rejected' }));
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.issues });
    }
    next(err);
  }
});


