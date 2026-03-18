import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { getComplexDirectory } from '../controllers/user.controller';
const router = Router();

// routes/user.routes.ts
router.get(
    '/complex-directory', 
    authenticate(), 
    authorize(['security', 'admin']), 
    getComplexDirectory
  );

export default router;
