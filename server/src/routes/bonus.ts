import { Router, type Request, type Response } from 'express';
import { listBonuses, claimBonus } from '../services/bonus.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (req: Request, res: Response) => {
  res.json({ bonuses: listBonuses((req as AuthedRequest).user.id) });
});

router.post('/:id/claim', requireAuth, (req: Request, res: Response) => {
  try {
    res.json(claimBonus((req as AuthedRequest).user.id, String(req.params.id)));
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

export default router;
