import { type NextFunction, type Request, type Response } from 'express';

import * as NotificationService from '../services/notification.service';

export const sendMassiveReminders = async (req: Request, res: Response) => {
  try {
    const { month } = req.body; // Se recibe el mes en formato YYYY-MM
    const complexId = req.user?.complex_id;

    if (!month) {
      return res.status(400).json({ message: "Month is required" });
    }

    const summary = await NotificationService.notifyPendingResidents(complexId!, month);

    res.json({
      message: "Process completed",
      summary
    });
  } catch (error) {
    res.status(500).json({ message: "Error sending notifications", error });
  }
};