import { Router, type Request, type Response } from 'express';
import { createUser, getOrCreateDemoUser, getUser } from '../services/store.js';
import { signToken, requireAuth, type AuthedRequest } from '../middleware/auth.js';

const router = Router();

// Demo login — instantly issues a session for a guest/demo player.
router.post('/guest', (req: Request, res: Response) => {
  const username = (req.body?.username || '').trim();
  const user = username ? createUser({ username }) : getOrCreateDemoUser();
  res.json({ token: signToken(user.id), user });
});

router.get('/me', requireAuth, (req: Request, res: Response) => {
  res.json({ user: getUser((req as AuthedRequest).user.id) });
});

export default router;
