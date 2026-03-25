import { Router } from 'express';
import { addVehicle, addPet, getMyHouse, deleteVehicle, deletePet } from '../controllers/house.controller';
import { createReservation, getReservations } from '../controllers/reservation.controller';
import { cancelVisit, getVisitHistory, registerVisit } from '../controllers/visit.controller';
import { uploadReceipt } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.post('/reservations', authenticate(), authorize(['resident']), createReservation);
router.get('/reservations', authenticate(), authorize(['resident']), getReservations);

router.post('/house/vehicles', authenticate(), authorize(['resident']), addVehicle);


export default router;