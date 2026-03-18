import { Router } from 'express';
import { processEntry, processExit, getRecentMovements } from '../controllers/security.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

// Endpoint para que el guardia escanee el QR
router.post('/scan-qr', authenticate(['security', 'admin']), processEntry);

// ... otras rutas
// El guardia usa el mismo QR para marcar la salida
router.post('/scan-exit', authenticate(), authorize(['security']), processExit);

// ... otros imports

// El monitor de la caseta llama a este para ver la tabla
router.get(
    '/recent-movements', 
    authenticate(['security', 'admin']), 
    getRecentMovements
  );
  

export default router;