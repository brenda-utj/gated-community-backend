import { type NextFunction, type Request, type Response } from 'express';

export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 1. Verificar si el usuario existe (el middleware de JWT debe ir antes)
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user data' });
    }

    // 2. Verificar si el rol del usuario está en la lista permitida
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden: Access restricted to ${allowedRoles.join(' or ')}` 
      });
    }

    next();
  };
};