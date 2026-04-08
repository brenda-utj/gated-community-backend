

import { Router } from 'express';
import { addVehicle, addPet, getMyHouse, deleteVehicle, deletePet } from '../controllers/house.controller';
import { createReport, getReports, getMaintenanceReport, updateReport, deleteReport, updateReportStatus } from '../controllers/report.controller';
import { cancelVisit, getVisitHistory, registerVisit } from '../controllers/visit.controller';
import { uploadReceipt } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { upload } from '../middlewares/upload.middleware';


const router = Router();

router.post('/',   authenticate(), upload.single('image'), createReport);
router.get('/',    authenticate(), getReports);
router.patch('/:id', authenticate(), upload.single('image'), updateReport);
router.delete('/:id', authenticate(), deleteReport);
router.put('/:id/status', authenticate(['admin']), updateReportStatus);


export default router;