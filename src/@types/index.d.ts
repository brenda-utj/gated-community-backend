import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: "super_admin" | "admin" | "resident" | "security";
        complex_id: string;
        house_id?: string; // Opcional porque los admin no tienen house_id
      };
    }
  }
}
