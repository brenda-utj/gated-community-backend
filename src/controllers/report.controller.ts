import { type NextFunction, type Request, type Response } from 'express';

import * as ReportService from '../services/report.service';

export const getMaintenanceReport = async (req: Request, res: Response) => {
  try {
    const { month } = req.query; // Ejemplo: ?month=2026-02
    const complexId = req.user?.complex_id;

    if (!month || typeof month !== 'string') {
      return res.status(400).json({ message: "Month is required in YYYY-MM format" });
    }

    const report = await ReportService.getMonthlyPaymentReport(complexId!, month);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: "Error generating report", error });
  }
};