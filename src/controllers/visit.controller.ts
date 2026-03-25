import { type NextFunction, type Request, type Response } from 'express';

import * as VisitService from '../services/visit.service';
import Visit from '../models/Visit';

export const registerVisit = async (req: any, res: Response) => {
  try {
    const { visitor_name, visitor_email, visit_date } = req.body;
    const house_id = req.user.house_id;

    // Llamamos al servicio con toda la información necesaria
    const result = await VisitService.createVisit({
      houseId: house_id,
      visitorName: visitor_name,
      visitorEmail: visitor_email,
      visitDate: new Date(visit_date)
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error("ERROR VISITS:", error);
    res.status(500).json({ message: error.message || 'Error creating visit' });
  }
};

export const getVisitHistory = async (req: any, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const query: any = { house_id: req.user.house_id };

    // Filtro por rango de fechas si se proporcionan
    if (startDate && endDate) {
      query.visit_date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const history = await Visit.find(query).sort({ visit_date: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching history", error });
  }
};

export const cancelVisit = async (req: any, res: Response) => {
  try {
    const { visitId } = req.params;
    // Solo puede cancelar si la visita es suya y aún no ha entrado
    const visit = await Visit.findOneAndUpdate(
      { _id: visitId, house_id: req.user.house_id, status: 'pending' },
      { status: 'cancelled' },
      { new: true }
    );

    if (!visit) return res.status(404).json({ message: "Visit not found or already processed" });
    res.json({ message: "Visit cancelled successfully" });
  } catch (error) {
    res.status(500).json({ error });
  }
};