import { type Request, type Response } from 'express';
import Report from '../models/Report';
import * as ReportService from '../services/report.service';
import House from '../models/House';


export const getMaintenanceReport = async (req: Request, res: Response) => {
  try {
    const { month } = req.query;
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

    // Obtenemos el complex_id del usuario directo desde la BD
    const User = (await import('../models/User')).default;
    const user = await User.findById(req.user.id).select('complex_id').lean();

    if (!user?.complex_id) {
      return res.status(400).json({ message: "No complex associated to this user" });
    }

    const reportData: any = {
      subject,
      description,
      user_id:    req.user.id,
      house_id:   req.user.house_id?._id ?? req.user.house_id,
      complex_id: user.complex_id,         // ← nuevo campo
    };

    if (req.file) {
      let fileBuffer: Buffer;

      if (req.file.buffer) {
        fileBuffer = req.file.buffer;
      } else if (req.file.path) {
        const fs = await import('fs');
        fileBuffer = fs.readFileSync(req.file.path);
        fs.unlinkSync(req.file.path);
      } else {
        return res.status(400).json({ message: "Could not process the uploaded file" });
      }

      reportData.image_url = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
    }

    const created = await Report.create(reportData);

    const report = await Report
      .findById(created._id)
      .populate(POPULATE_HOUSE)
      .populate(POPULATE_USER);

    res.status(201).json({ message: "Report created successfully", report });

  } catch (error: any) {
    res.status(400).json({ message: error.message || "Error creating report" });
  }
};

// ─── Campos a popular reutilizables ───────────────────────────────────────────
const POPULATE_HOUSE = { path: 'house_id', select: 'street house_number' };
const POPULATE_USER  = { path: 'user_id',  select: 'first_name last_name email phone' };

export const getReports = async (req: any, res: Response) => {
  try {
    const { role, id } = req.user;

    let filter: Record<string, any> = {};

    if (role === 'resident') {
      // Solo ve sus propios reportes
      filter = { user_id: id };

    } else if (role === 'admin' || role === 'security') {
      // Obtiene complex_id desde la BD (no del token)
      const User = (await import('../models/User')).default;
      const user = await User.findById(id).select('complex_id').lean();

      if (!user?.complex_id) {
        return res.status(400).json({ message: "No complex associated to this user" });
      }

      // Filtra directo por complex_id — sin necesidad de buscar casas
      filter = { complex_id: user.complex_id };

    } else {
      return res.status(403).json({ message: "Forbidden" });
    }

    const data = await Report
      .find(filter)
      .populate(POPULATE_HOUSE)
      .populate(POPULATE_USER)
      .sort({ createdAt: -1 });

    res.json(data);

  } catch (error: any) {
    res.status(500).json({ message: error.message || "Error fetching reports" });
  }
};

export const updateReport = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { subject, description } = req.body;

    const report = await Report.findOne({ _id: id, house_id: req.user.house_id });

    if (!report) {
      return res.status(404).json({ message: "Report not found or not authorized" });
    }

    const updateData: any = {};

    if (subject) updateData.subject = subject;
    if (description) updateData.description = description;

    // 📸 Imagen opcional — reemplaza la anterior si se manda una nueva
    if (req.file) {
      let fileBuffer: Buffer;

      if (req.file.buffer) {
        fileBuffer = req.file.buffer;
      } else if (req.file.path) {
        const fs = await import('fs');
        fileBuffer = fs.readFileSync(req.file.path);
        fs.unlinkSync(req.file.path);
      } else {
        return res.status(400).json({ message: "Could not process the uploaded file" });
      }

      updateData.image_url = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
    }

    const updated = await Report.findByIdAndUpdate(id, updateData, { new: true });

    res.json({ message: "Report updated successfully", report: updated });

  } catch (error: any) {
    res.status(400).json({ message: error.message || "Error updating report" });
  }
};

export const deleteReport = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const report = await Report.findOneAndDelete({ _id: id, house_id: req.user.house_id });

    if (!report) {
      return res.status(404).json({ message: "Report not found or not authorized" });
    }

    res.json({ message: "Report deleted successfully" });

  } catch (error: any) {
    res.status(400).json({ message: error.message || "Error deleting report" });
  }
};

export const updateReportStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { role } = req.user;

    // Solo admin puede cambiar el status
    if (role !== 'admin') {
      return res.status(403).json({ message: "Only admins can update report status" });
    }

    const ALLOWED = ['in_progress', 'closed'];
    if (!ALLOWED.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${ALLOWED.join(', ')}`
      });
    }

    // Verificar que el reporte pertenece al mismo complejo del admin
    const User = (await import('../models/User')).default;
    const admin = await User.findById(req.user.id).select('complex_id').lean();

    if (!admin?.complex_id) {
      return res.status(400).json({ message: "No complex associated to this admin" });
    }

    const report = await Report
      .findOneAndUpdate(
        { _id: id, complex_id: admin.complex_id },  // ← solo reportes de su complejo
        { status },
        { new: true }
      )
      .populate(POPULATE_HOUSE)
      .populate(POPULATE_USER);

    if (!report) {
      return res.status(404).json({ message: "Report not found or not authorized" });
    }

    res.json({ message: "Report status updated", report });

  } catch (error: any) {
    res.status(400).json({ message: error.message || "Error updating report status" });
  }
};