import { Router } from 'express';
import { listSports, getOdds, getFeaturedFeed, getQuota } from '../services/oddsApi.js';
import { placeSportsBet, getMyBets } from '../services/sportsBetting.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/sports', async (_req, res, next) => {
  try {
    res.json({ sports: await listSports(), quota: getQuota() });
  } catch (e) {
    next(e);
  }
});

router.get('/featured', async (_req, res, next) => {
  try {
    res.json({ feed: await getFeaturedFeed(), quota: getQuota() });
  } catch (e) {
    next(e);
  }
});

router.get('/sports/:sportKey/odds', async (req, res, next) => {
  try {
    res.json({ events: await getOdds(req.params.sportKey) });
  } catch (e) {
    next(e);
  }
});

router.post('/bets', requireAuth, (req, res, next) => {
  try {
    const { legs, stake } = req.body || {};
    const bet = placeSportsBet({ user: req.user, legs, stake: Number(stake) });
    res.json({ bet });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/bets', requireAuth, (req, res) => {
  res.json({ bets: getMyBets(req.user.id) });
});

export default router;
