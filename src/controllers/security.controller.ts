import { type NextFunction, type Request, type Response } from 'express';
import * as VisitService from '../services/visit.service';
import Visit from '../models/Visit';
import House from '../models/House';

// Acción para marcar la ENTRADA
export const processEntry = async (req: any, res: Response) => {
  try {
    const { qr_hash } = req.body;
    const complex_id = req.user.complex_id?._id;

    const validatedVisit = await VisitService.validateQR(qr_hash, complex_id);

    res.status(200).json({
      message: "Access Granted",
      visitor: validatedVisit.visitor_name,
      check_in: validatedVisit.check_in_time
    });
  } catch (error: any) {
    res.status(403).json({ message: "Access Denied", reason: error.message });
  }
};

// Acción para marcar la SALIDA
export const processExit = async (req: any, res: Response) => {
  try {
    const { qr_hash } = req.body;
    const complex_id = req.user.complex_id?._id;

    const result = await VisitService.registerExit(qr_hash, complex_id);

    res.status(200).json({ 
      message: "Exit recorded successfully", 
      visitor: result.visitor_name,
      check_out: result.check_out_time
    });
  } catch (error: any) {
    res.status(400).json({ message: "Error recording exit", reason: error.message });
  }
};

export const getRecentMovements = async (req: any, res: Response) => {
  try {
    // 1. Obtener el ID del complejo del token del guardia
    const complexId = req.user.complex_id;

    // 2. Encontrar todas las casas que pertenecen a ese complejo
    const housesInComplex = await House.find({ complex_id: complexId }).select('_id');
    const houseIds = housesInComplex.map(h => h._id);

    // 3. Buscar visitas que pertenezcan a esas casas y tengan movimientos
    const movements = await Visit.find({
      house_id: { $in: houseIds },
      status: { $in: ['entered', 'exited'] }
    })
    .populate('house_id', 'address house_number street')
    .sort({ updatedAt: -1 }) // El movimiento más reciente primero
    .limit(20);

    res.status(200).json(movements);
  } catch (error: any) {
    res.status(500).json({ message: "Error al obtener historial", error: error.message });
  }
};