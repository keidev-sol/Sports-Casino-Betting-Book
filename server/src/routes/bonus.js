import { Router } from 'express';
import { listBonuses, claimBonus } from '../services/bonus.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  res.json({ bonuses: listBonuses(req.user.id) });
});

router.post('/:id/claim', requireAuth, (req, res) => {
  try {
    res.json(claimBonus(req.user.id, req.params.id));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
