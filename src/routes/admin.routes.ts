import { Router } from 'express';
import { deleteMember, getMembers, registerUserByAdmin, updateMember } from '../controllers/admin.controller';
import { verifyPayment } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { getMaintenanceReport } from '../controllers/report.controller';
import { sendMassiveReminders } from '../controllers/notification.controller';
// Importamos el nuevo controlador de casas
import { 
  getHouses, 
  createHouse, 
  updateHouse, 
  deleteHouse 
} from '../controllers/house.controller';

const router = Router();

/**
 * GESTIÓN DE VIVIENDAS (CASAS)
 * Un administrador solo gestiona las casas de su propio complex_id
 */
router.get('/houses', authenticate(), authorize(['admin', 'super_admin']), getHouses);
router.post('/houses', authenticate(), authorize(['admin']), createHouse);
router.patch('/houses/:id', authenticate(), authorize(['admin']), updateHouse);
router.delete('/houses/:id', authenticate(), authorize(['admin']), deleteHouse);

/**
 * GESTIÓN DE MIEMBROS
 */
// --- GESTIÓN DE MIEMBROS ---
// Obtener todos
router.get('/members', authenticate(), authorize(['admin', 'super_admin']), getMembers);
// Crear
router.post('/members', authenticate(), authorize(['admin']), registerUserByAdmin);
// Editar
router.patch('/members/:id', authenticate(), authorize(['admin']), updateMember);
// Eliminar
router.delete('/members/:id', authenticate(), authorize(['admin']), deleteMember);

/**
 * PAGOS Y REPORTES
 */
router.patch('/payments/verify/:paymentId', authenticate(), authorize(['admin']), verifyPayment);
router.get('/reports/payments', authenticate(), authorize(['admin']), getMaintenanceReport);
router.post('/reports/notify-unpaid', authenticate(), authorize(['admin']), sendMassiveReminders);

export default router;