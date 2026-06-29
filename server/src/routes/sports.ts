import { Router, type Request, type Response, type NextFunction } from 'express';
import { listSports, getOdds, getFeaturedFeed, getQuota } from '../services/oddsApi.js';
import { placeSportsBet, getMyBets } from '../services/sportsBetting.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';

const router = Router();

router.get('/sports', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ sports: await listSports(), quota: getQuota() });
  } catch (e) {
    next(e);
  }
});

router.get('/featured', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ feed: await getFeaturedFeed(), quota: getQuota() });
  } catch (e) {
    next(e);
  }
});

router.get('/sports/:sportKey/odds', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ events: await getOdds(String(req.params.sportKey)) });
  } catch (e) {
    next(e);
  }
});

router.post('/bets', requireAuth, (req: Request, res: Response) => {
  try {
    const { legs, stake } = req.body || {};
    const bet = placeSportsBet({ user: (req as AuthedRequest).user, legs, stake: Number(stake) });
    res.json({ bet });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.get('/bets', requireAuth, (req: Request, res: Response) => {
  res.json({ bets: getMyBets((req as AuthedRequest).user.id) });
});

export default router;
