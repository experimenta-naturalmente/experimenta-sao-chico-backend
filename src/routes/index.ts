import { Router } from 'express';
import categoryRoutes from './category.routes';
import tagRoutes from './tag.routes';
import spotRoutes from './spot.routes';
import eventRoutes from './event.routes';
import routeRoutes from './route.routes';
import userRoutes from './user.routes';
import uploadRoutes from './upload.routes';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));

router.use(categoryRoutes);
router.use(tagRoutes);
router.use(spotRoutes);
router.use(eventRoutes);
router.use(routeRoutes);
router.use(userRoutes);
router.use(uploadRoutes);

export default router;
