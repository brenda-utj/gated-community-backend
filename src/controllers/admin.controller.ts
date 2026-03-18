import { type NextFunction, type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { generateRandomPassword } from '../utils/generatePassword';
import { sendWelcomeEmail } from '../services/email.service';

export const registerUserByAdmin = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, role, phone, house_id, password } = req.body;

    // 1. Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const tempPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Crear usuario (usando el complex_id del Admin que está creando)
    const newUser = new User({
      complex_id: req.user?.complex_id, 
      house_id: role === 'resident' ? house_id : undefined,
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role,
      phone,
      must_change_password: true // Forzamos el cambio
    });

    await newUser.save();

    // Enviamos el correo (podemos hacerlo de forma asíncrona sin esperar)
    /*sendWelcomeEmail(email, first_name, tempPassword).catch(err => 
      console.error("Error enviando correo:", err)
    );*/
    
    res.status(201).json({ message: `User with role ${role} created successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

export const getMembers = async (req: Request, res: Response) => {
  try {
    // El complex_id viene del middleware authenticate
    const { complex_id } = req.user!;

    const members = await User.find({ 
      complex_id, 
      deleted_at: null // Filtramos eliminados
    })
    .populate('house_id') // Traemos info de la casa
    .sort({ first_name: 1 });

    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching members', error });
  }
};

export const updateMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { complex_id } = req.user!;
    const { first_name, last_name, email, role, phone, house_id } = req.body;

    // Buscamos y validamos que el miembro pertenezca al mismo complejo del Admin
    const member = await User.findOne({ _id: id, complex_id });

    if (!member) {
      return res.status(404).json({ message: 'Member not found or not authorized' });
    }

    // Actualizamos campos permitidos
    member.first_name = first_name || member.first_name;
    member.last_name = last_name || member.last_name;
    member.email = email || member.email;
    member.role = role || member.role;
    member.phone = phone || member.phone;
    
    // Si deja de ser residente, quitamos la casa
    member.house_id = role === 'resident' ? house_id : undefined;

    await member.save();

    res.status(200).json({ message: 'Member updated successfully', member });
  } catch (error) {
    res.status(500).json({ message: 'Error updating member', error });
  }
};

// 3. Eliminación lógica (Soft Delete)
export const deleteMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { complex_id } = req.user!;

    // No permitir que el admin se borre a sí mismo accidentalmente en este endpoint
    if (id === req.user?.id) {
      return res.status(400).json({ message: 'Cannot delete your own admin account' });
    }

    const member = await User.findOneAndUpdate(
      { _id: id, complex_id },
      { deleted_at: new Date() },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ message: 'Member not found or not authorized' });
    }

    res.status(200).json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting member', error });
  }
};