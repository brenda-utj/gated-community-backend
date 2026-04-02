import { type NextFunction, type Request, type Response } from 'express';

import Complex from '../models/Complex';
import User from '../models/User';
import bcrypt from 'bcrypt';

export const createComplexWithAdmin = async (req: Request, res: Response) => {
  try {
    // 1. Extraemos TODO del mismo nivel (req.body)
    const { 
      complex_name, 
      address, 
      admin_first_name, 
      admin_last_name, 
      admin_email,
      admin_password // <--- Ahora lo recibimos directamente
    } = req.body;

    // 2. Crear el Fraccionamiento
    // Nota: Asegúrate que tu modelo use 'name' (o cámbialo a 'complex_name' en el modelo)
    const newComplex = await Complex.create({ 
      name: complex_name, 
      address 
    });

    // 3. Encriptar la contraseña recibida del front
    const hashedPassword = await bcrypt.hash(admin_password, 10);

    // 4. Crear al Admin con los datos individuales
    const newAdmin = await User.create({
      first_name: admin_first_name,
      last_name: admin_last_name,
      email: admin_email,
      password: hashedPassword,
      role: 'admin',
      complex_id: newComplex._id // Vinculamos al complejo recién creado
    });

    res.status(201).json({
      message: "Complex and Admin created successfully",
      complex: newComplex,
      admin: { email: newAdmin.email }
    });
    
  } catch (error: any) {
    console.error("Error en createComplexWithAdmin:", error);
    res.status(500).json({ 
      message: "Error al crear el complejo", 
      error: error.message 
    });
  }
};

export const getComplexes = async (req: Request, res: Response) => {
  try {
    const complexes = await Complex.aggregate([
      { $match: { deleted_at: null } },
      { $sort: { created_at: -1 } },
      {
        $lookup: {
          from: 'users', // Nombre de la colección de usuarios en la DB
          let: { complexId: '$_id' },
          pipeline: [
            { 
              $match: { 
                $expr: { 
                  $and: [
                    { $eq: ['$complex_id', '$$complexId'] },
                    { $eq: ['$role', 'admin'] }
                  ]
                }
              } 
            },
            { $sort: { created_at: 1 } }, // El primero registrado
            { $limit: 1 }, // Solo uno
            { $project: { first_name: 1, last_name: 1, email: 1 } }
          ],
          as: 'admin_user'
        }
      },
      {
        $addFields: {
          // El lookup devuelve un array, tomamos el primer elemento
          admin_user: { $arrayElemAt: ['$admin_user', 0] }
        }
      }
    ]);

    res.status(200).json(complexes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener fraccionamientos', error });
  }
};

export const updateComplex = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // El ID del complejo
    const { 
      name, 
      complex_name, 
      address, 
      subscription_status,
      admin_first_name,
      admin_last_name,
      admin_email,
      admin_password // <--- Contraseña opcional
    } = req.body;

    // 1. Actualizar el Complejo
    const complexUpdateData = {
      name: name || complex_name,
      address,
      subscription_status
    };

    const updatedComplex = await Complex.findByIdAndUpdate(
      id,
      { $set: complexUpdateData },
      { new: true, runValidators: true }
    );

    if (!updatedComplex) {
      return res.status(404).json({ message: 'Fraccionamiento no encontrado' });
    }

    // 2. Preparar la actualización del Admin
    const adminUpdateData: any = {
      first_name: admin_first_name,
      last_name: admin_last_name,
      email: admin_email,
    };

    // Lógica para la contraseña: solo si viene en el body y no está vacía
    if (admin_password && admin_password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      adminUpdateData.password = await bcrypt.hash(admin_password, salt);
    }

    // 3. Buscar y actualizar al usuario con rol 'admin' vinculado a este complejo
    const updatedAdmin = await User.findOneAndUpdate(
      { complex_id: id, role: 'admin' }, 
      { $set: adminUpdateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Fraccionamiento y Administrador actualizados correctamente',
      complex: updatedComplex,
      admin: updatedAdmin ? { email: updatedAdmin.email } : "No se encontró admin para este complejo"
    });

  } catch (error: any) {
    console.error("Update Error:", error);
    res.status(500).json({ 
      message: 'Error al actualizar el fraccionamiento', 
      error: error.message 
    });
  }
};

export const changeComplexStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { subscription_status } = req.body;

    const updated = await Complex.findByIdAndUpdate(
      id, 
      { $set: { subscription_status } }, 
      { new: true }
    );

    res.status(200).json({ message: 'Estado actualizado', status: updated?.subscription_status });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar estado' });
  }
};


export const deleteComplex = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedComplex = await Complex.findByIdAndUpdate(
      id,
      { $set: { deleted_at: new Date() } }, // Marcamos la fecha de borrado
      { new: true }
    );

    if (!deletedComplex) {
      return res.status(404).json({ message: 'Fraccionamiento no encontrado' });
    }

    res.status(200).json({ message: 'Fraccionamiento eliminado correctamente' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al eliminar', error: error.message });
  }
};