import { type NextFunction, type Request, type Response } from 'express';
import * as PaymentService from '../services/payment.service';
import MaintenancePayment from '../models/MaintenancePayment';
import House from '../models/House';

// export const uploadReceipt = async (req: any, res: Response) => {
//   try {
//     if (!req.file) return res.status(400).json({ message: "Receipt image is required" });

//     const { amount, month_covered } = req.body;

//     const payment = await PaymentService.processPaymentUpload({
//       house_id: req.user.house_id,
//       resident_id: req.user.id,
//       amount: Number(amount),
//       month_covered,
//       file: req.file
//     });

//     res.status(201).json({ message: "Receipt uploaded successfully", payment });
//   } catch (error: any) {
//     res.status(400).json({ message: error.message });
//   }
// };

export const uploadReceipt = async (req: any, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Receipt image is required" });

    const { amount, month_covered } = req.body;

    // Verificar que no exista ya un pago pendiente/verificado para ese mes
    const existing = await MaintenancePayment.findOne({
      house_id: req.user.house_id,
      month_covered,
      status: { $in: ['pending', 'verified'] }
    });

    if (existing) {
      return res.status(400).json({ 
        message: `A payment for ${month_covered} is already registered or pending.` 
      });
    }

    // Convertir buffer a base64
    const receipt_base64 = req.file.buffer.toString('base64');
    const receipt_mime   = req.file.mimetype;

    const payment = await MaintenancePayment.create({
      house_id:    req.user.house_id,
      resident_id: req.user.id,
      amount:      Number(amount),
      month_covered,
      receipt_base64,
      receipt_mime
    });

    res.status(201).json({ message: "Receipt uploaded successfully", payment });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getMyPayments = async (req: any, res: Response) => {
  try {
    const { role, house_id, complex_id } = req.user;
    let query = {};

    if (role === 'resident') {
      // El residente solo ve lo de su casa
      query = { house_id: house_id };
    } 
    else if (role === 'admin') {
      // 1. Buscamos todas las IDs de las casas que pertenecen al complejo del admin
      const housesInComplex = await House.find({ complex_id: complex_id }).select('_id');
      const houseIds = housesInComplex.map(h => h._id);

      // 2. Filtramos los pagos cuyo house_id esté en esa lista
      query = { house_id: { $in: houseIds } };
    } 
    else {
      return res.status(403).json({ message: "No autorizado" });
    }

    const payments = await MaintenancePayment.find(query)
      .populate('resident_id', 'first_name last_name')
      .populate('house_id', 'address house_number street')
      .sort({ created_at: -1 });

    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ message: "Error al obtener pagos", error: error.message });
  }
};

// Solo para ADMIN: Validar pago
export const verifyPayment = async (req: any, res: Response) => {
  const { paymentId } = req.params;
  const { status, notes } = req.body; // status: 'verified' | 'rejected'

  const payment = await MaintenancePayment.findByIdAndUpdate(
    paymentId,
    { status, notes },
    { new: true }
  );
  res.json(payment);
};