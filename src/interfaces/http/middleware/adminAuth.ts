import type { Request, Response, NextFunction } from 'express';
import { getAdminKey } from '../../../infrastructure/config/env';

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const expected = getAdminKey();
  const provided = req.header('X-ADMIN-KEY');
  if (!expected || provided !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
}


