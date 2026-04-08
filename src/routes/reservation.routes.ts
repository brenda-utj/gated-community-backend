import { Router } from 'express';
import { addVehicle, addPet, getMyHouse, deleteVehicle, deletePet } from '../controllers/house.controller';
import { createReservation, getReservations, updateReservation, cancelReservation, deleteReservation } from '../controllers/reservation.controller';
import { cancelVisit, getVisitHistory, registerVisit } from '../controllers/visit.controller';
import { uploadReceipt } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.post('/', authenticate(), authorize(['resident']), createReservation);
router.get('/', authenticate(), authorize(['resident']), getReservations);
router.put('/:id', authenticate(), authorize(['resident']), updateReservation);
router.patch('/:id/cancel', authenticate(), authorize(['resident']), cancelReservation);
router.delete('/reservations/:id', authenticate(), authorize(['resident']), deleteReservation);

router.post('/house/vehicles', authenticate(), authorize(['resident']), addVehicle);


export default router;