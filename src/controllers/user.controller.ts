import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user?.id; // Obtenido del token JWT

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      must_change_password: false // <-- Aquí liberamos al usuario
    });

    res.json({ message: 'Password updated successfully. You can now use the system.' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating password' });
  }
};

// controllers/user.controller.ts
export const getComplexDirectory = async (req: any, res: Response) => {
  try {
    const { complex_id } = req.user; // Obtenido del token JWT

    const directory = await User.find({
      complex_id: complex_id,
      role: 'resident',
      deleted_at: null
    })
    .populate('house_id', 'address house_number street') // Traemos info de la casa
    .select('first_name last_name phone email house_id') // Solo datos necesarios
    .sort({ first_name: 1 });

    res.json(directory);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el directorio", error });
  }
};