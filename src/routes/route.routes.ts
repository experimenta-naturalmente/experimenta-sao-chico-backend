import { Router } from 'express';
import { db } from '../config/firebase';
import { HttpError } from '../middlewares/errorHandler';
import { toRoute } from '../mappers';

const router = Router();

router.get('/route', async (_req, res, next) => {
  try {
    const snap = await db.collection('routes').get();
    res.json(snap.docs.map((d) => toRoute(d.data())));
  } catch (e) {
    next(e);
  }
});

router.get('/route/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const snap = await db
      .collection('routes')
      .where('id', '==', id)
      .limit(1)
      .get();
    if (snap.empty) {
      throw new HttpError(404, 'Rota não encontrada.');
    }
    res.json(toRoute(snap.docs[0].data()));
  } catch (e) {
    next(e);
  }
});

export default router;
