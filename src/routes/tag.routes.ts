import { Router } from 'express';
import { db } from '../config/firebase';
import { toTag } from '../mappers';

const router = Router();

router.get('/tag', async (_req, res, next) => {
  try {
    const snap = await db.collection('tags').get();
    res.json(snap.docs.map((d) => toTag(d.data())));
  } catch (e) {
    next(e);
  }
});

export default router;
