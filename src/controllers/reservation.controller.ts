import { Reservation } from "../models/Reservation";
import { type NextFunction, type Request, type Response } from 'express';

export const createReservation = async (req: any, res: Response) => {
  try {
    const reservation = await Reservation.create({
      ...req.body,
      user_id: req.user.id,
      house_id: req.user.house_id
    });

    res.json(reservation);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getReservations = async (req: any, res: Response) => {
  const data = await Reservation.find({ house_id: req.user.house_id }).sort({ date: -1 });
  res.json(data);
};