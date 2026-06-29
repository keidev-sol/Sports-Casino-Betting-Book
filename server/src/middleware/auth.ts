import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';
import { getUser } from '../services/store.js';
import type { User } from '../../../shared/types.js';

// Request augmented with the authenticated user (set by requireAuth).
export interface AuthedRequest extends Request {
  user: User;
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: '7d' });
}

export function verifyToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    return typeof payload === 'object' && payload.sub ? String(payload.sub) : null;
  } catch {
    return null;
  }
}

// Express middleware — attaches req.user or 401s.
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const userId = token && verifyToken(token);
  const user = userId ? getUser(userId) : null;
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  (req as AuthedRequest).user = user;
  next();
}
