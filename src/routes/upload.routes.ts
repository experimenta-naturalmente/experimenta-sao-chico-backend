import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middlewares/auth';
import { HttpError } from '../middlewares/errorHandler';
import { uploadObject } from '../config/storage';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

router.post('/upload', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new HttpError(400, 'Arquivo ausente (campo "file").');
    }
    const url = await uploadObject(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype || 'application/octet-stream',
    );
    res.status(201).json({ url });
  } catch (e) {
    next(e);
  }
});

export default router;
