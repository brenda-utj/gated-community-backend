import { Reservation } from "../models/Reservation";
import User from "../models/User";
import { type NextFunction, type Request, type Response } from 'express';

export const createReservation = async (req: any, res: Response) => {
  try {
    // 1. Buscamos al usuario en la BD usando el ID del token (req.user.id)
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 2. Creamos la reservación con los IDs obtenidos de la BD
    const reservation = await Reservation.create({
      ...req.body,
      user_id: user._id,
      house_id: user.house_id,
      complex_id: user.complex_id
    });

    res.status(201).json(reservation);
  } catch (error: any) {
    res.status(500).json({ 
      message: "Error al crear la reservación", 
      error: error.message 
    });
  }
};

export const getReservations = async (req: any, res: Response) => {
  try {
    // 1. Buscamos al usuario en la BD para tener su rol y complex_id actualizados
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 2. Definimos el filtro de búsqueda según el rol
    let query = {};

    if (user.role === 'admin' || user.role === 'security') {
      // Regla 1: Admin/Security ven todo lo de su complejo
      query = { complex_id: user.complex_id };
    } else if (user.role === 'resident') {
      // Regla 2: Resident solo ve sus propias reservaciones
      query = { user_id: user._id };
    } else if (user.role === 'super_admin') {
      // Opcional: El super_admin podría ver absolutamente todo
      query = {};
    }

    // 3. Ejecutamos la consulta con el filtro dinámico
    const data = await Reservation.find(query)
      .populate('user_id', 'first_name last_name') // Opcional: para ver quién reservó
      .sort({ date: -1 });

    res.json(data);

  } catch (error: any) {
    res.status(500).json({ 
      message: "Error al obtener las reservaciones", 
      error: error.message 
    });
  }
};

export const cancelReservation = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findOneAndUpdate(
      { _id: id, user_id: req.user.id }, // 🔥 seguridad
      { status: 'cancelled' },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    res.json(reservation);

  } catch (error) {
    res.status(500).json(error);
  }
};

export const updateReservation = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findOneAndUpdate(
      { _id: id, user_id: req.user.id },
      req.body,
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    res.json(reservation);

  } catch (error) {
    res.status(500).json(error);
  }
};

export const deleteReservation = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findOneAndDelete({
      _id: id,
      user_id: req.user.id // 🔥 seguridad
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    res.json({ message: 'Reserva eliminada correctamente' });

  } catch (error) {
    res.status(500).json(error);
  }
};