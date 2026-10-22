import { Router } from 'express';
import { db } from '../config/firebase';
import { toCategory, toTag } from '../mappers';

const router = Router();

router.get('/category', async (_req, res, next) => {
  try {
    const snap = await db.collection('categories').get();
    res.json(snap.docs.map((d) => toCategory(d.data())));
  } catch (e) {
    next(e);
  }
});

router.get('/category/:id/tags', async (req, res, next) => {
  try {
    const categoryId = Number(req.params.id);
    const snap = await db.collection('tags').get();
    const tags = snap.docs
      .map((d) => toTag(d.data()))
      .filter((t) => t.categories.some((c) => c.categoryId === categoryId));
    res.json(tags);
  } catch (e) {
    next(e);
  }
});

export default router;
