import { Router } from 'express';
import { db } from '../config/firebase';
import { HttpError } from '../middlewares/errorHandler';
import { toUser } from '../mappers';

const router = Router();

router.get('/users/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const snap = await db
      .collection('users')
      .where('id', '==', id)
      .limit(1)
      .get();
    if (snap.empty) {
      throw new HttpError(404, 'Usuário não encontrado.');
    }
    res.json(toUser(snap.docs[0].data()));
  } catch (e) {
    next(e);
  }
});

export default router;
