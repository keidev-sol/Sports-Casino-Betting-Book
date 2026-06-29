import { Router } from 'express';
import { createUser, getOrCreateDemoUser, getUser } from '../services/store.js';
import { signToken, requireAuth } from '../middleware/auth.js';

const router = Router();

// Demo login — instantly issues a session for a guest/demo player.
router.post('/guest', (req, res) => {
  const username = (req.body?.username || '').trim();
  const user = username ? createUser({ username }) : getOrCreateDemoUser();
  res.json({ token: signToken(user.id), user });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: getUser(req.user.id) });
});

export default router;
