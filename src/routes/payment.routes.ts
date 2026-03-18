import { Router } from "express";
import {
  uploadReceipt,
  getMyPayments,
  verifyPayment,
} from "../controllers/payment.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";
import { authorize } from "../middlewares/role.middleware"; // El que valida el ROL
const router = Router();

// El residente sube su pago
router.post(
  "/upload",
  authenticate(["resident"]),
  authorize(["resident"]),
  upload.single("receipt"), // 'receipt' es el nombre del campo en el form-data
  uploadReceipt,
);

// El residente ve su historial
router.get(
  "/history", 
  authenticate(), 
  authorize(["resident", "admin"]), 
  getMyPayments
);
// El ADMIN revisa los pagos de todos
router.patch(
  "/verify/:paymentId",
  authenticate(["admin"]),
  authorize(["admin"]),
  verifyPayment,
);

export default router;
