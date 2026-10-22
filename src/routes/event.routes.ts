import { Router } from 'express';
import { db } from '../config/firebase';
import { requireAuth } from '../middlewares/auth';
import { HttpError } from '../middlewares/errorHandler';
import { toEvent } from '../mappers';
import { normalizeExperienceRegistration } from '../normalizers';

const router = Router();

router.get('/event', async (_req, res, next) => {
  try {
    const snap = await db.collection('events').get();
    res.json(snap.docs.map((d) => toEvent(d.data())));
  } catch (e) {
    next(e);
  }
});

router.get('/event/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const snap = await db
      .collection('events')
      .where('id', '==', id)
      .limit(1)
      .get();
    if (snap.empty) {
      throw new HttpError(404, 'Evento não encontrado.');
    }
    res.json(toEvent(snap.docs[0].data()));
  } catch (e) {
    next(e);
  }
});

router.post('/event', requireAuth, async (req, res, next) => {
  try {
    const event = normalizeExperienceRegistration(req.body, 'event');
    await db.collection('events').doc(String(event.id)).set(event);
    res.status(201).json(toEvent(event));
  } catch (e) {
    next(e);
  }
});

export default router;
