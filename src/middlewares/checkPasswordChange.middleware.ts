export const forcePasswordChange = (req: any, res: Response, next: NextFunction) => {
  // Si el usuario ya está autenticado pero aún debe cambiar su pass
  // y no está intentando acceder al endpoint de cambiar contraseña...
  if (req.user && req.user.mustChangePassword && req.path !== '/change-password') {
    return res.status(403).json({ 
      message: 'Access denied: You must change your temporary password first.' 
    });
  }
  next();
};