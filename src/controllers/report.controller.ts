import { type NextFunction, type Request, type Response } from 'express';
import Report from '../models/Report';

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

export const createReport = async (req: any, res: Response) => {
  try {
    const { subject, description } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ message: "Subject and description are required" });
    }

    const reportData: any = {
      subject,
      description,
      user_id: req.user.id,
      house_id: req.user.house_id
    };

    console.log("Creating report with data:", req.file);

    // 📸 Si viene imagen, la agregamos
    if (req.file) {
      reportData.image_url = req.file.path;
      console.log("Report image uploaded:", req.file.path);
    }

    const report = await Report.create(reportData);

    res.status(201).json({
      message: "Report created successfully",
      report
    });

  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Error creating report"
    });
  }
};

export const getReports = async (req: any, res: Response) => {
  const data = await Report.find({ house_id: req.user.house_id }).sort({ createdAt: -1 });
  res.json(data);
};

