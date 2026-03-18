import { type NextFunction, type Request, type Response } from 'express';
import jwt from "jsonwebtoken";

export const authenticate = (roles: string[] = []) => {
  return (req: any, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      req.user = {
        id: decoded.id,
        role: decoded.role,
        complex_id: decoded.complex_id,
        house_id: decoded.house_id,
      };
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  };
};
