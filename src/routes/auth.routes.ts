import { Router } from 'express';
import { login } from '../controllers/auth.controller';
import { registerUserByAdmin } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { updatePassword } from '../controllers/user.controller';

const router = Router();

// Público
router.post('/login', login);

router.post('/change-password', authenticate, updatePassword);

// Privado: Solo Admin puede registrar nuevos usuarios
router.post(
  '/register-member', 
  authenticate, 
  authorize(['admin']), 
  registerUserByAdmin
);

export default router;