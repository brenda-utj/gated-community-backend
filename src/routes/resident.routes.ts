import { Router } from 'express';
import { addVehicle, addPet, getMyHouse, deleteVehicle, deletePet } from '../controllers/house.controller';
import { cancelVisit, getVisitHistory, registerVisit } from '../controllers/visit.controller';
import { uploadReceipt } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// Obtener la información de la casa del residente actual
router.get('/house', authenticate(), authorize(['resident']), getMyHouse);

// Gestión de la propiedad (Vehículos y Mascotas)
router.post('/house/vehicles', authenticate(), authorize(['resident']), addVehicle);
router.delete('/house/vehicles/:vehicleId', authenticate(), authorize(['resident']), deleteVehicle);
router.post('/house/pets', authenticate(), authorize(['resident']), addPet);
router.delete('/house/pets/:petId', authenticate(), authorize(['resident']), deletePet);


// Generación de QRs para visitas
router.post('/visits', authenticate(), authorize(['resident']), registerVisit);

// ... otras rutas
router.get('/visits/history', authenticate(), authorize(['resident']), getVisitHistory);
router.patch('/visits/:visitId/cancel', authenticate(), authorize(['resident']), cancelVisit);

// Subida de comprobante de pago
router.post(
  '/payments/upload', 
  authenticate(), 
  authorize(['resident']), 
  upload.single('receipt'), 
  uploadReceipt
);

export default router;