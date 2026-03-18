import { Router } from 'express';
import { registerVisit } from '../controllers/visit.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Only residents can create visits
router.post('/', authenticate(['resident']), registerVisit);

export default router;