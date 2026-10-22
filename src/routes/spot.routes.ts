import { Router } from 'express';
import { db } from '../config/firebase';
import { requireAuth } from '../middlewares/auth';
import { HttpError } from '../middlewares/errorHandler';
import { toSpot } from '../mappers';
import { normalizeExperienceRegistration } from '../normalizers';

const router = Router();

router.get('/spot', async (req, res, next) => {
  try {
    const { profileId } = req.query;
    let query: FirebaseFirestore.Query = db.collection('spots');
    if (profileId !== undefined) {
      query = query.where('profileId', '==', Number(profileId));
    }
    const snap = await query.get();
    res.json(snap.docs.map((d) => toSpot(d.data())));
  } catch (e) {
    next(e);
  }
});

router.get('/spot/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const snap = await db
      .collection('spots')
      .where('id', '==', id)
      .limit(1)
      .get();
    if (snap.empty) {
      throw new HttpError(404, 'Spot não encontrado.');
    }
    res.json(toSpot(snap.docs[0].data()));
  } catch (e) {
    next(e);
  }
});

router.post('/spot', requireAuth, async (req, res, next) => {
  try {
    const spot = normalizeExperienceRegistration(req.body, 'spot');
    await db.collection('spots').doc(String(spot.id)).set(spot);
    res.status(201).json(toSpot(spot));
  } catch (e) {
    next(e);
  }
});

export default router;
