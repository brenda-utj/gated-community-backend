import House from '../models/House.js';
import mongoose from 'mongoose';
import type { Request, Response, NextFunction } from "express";
import User from '../models/User.js';


export const getResidentsByComplex = async (req: Request, res: Response) => {
  try {

    const user = req.user;

    let match: any = {
      role: 'resident'
    };

    if (user?.role === 'admin' && user.complex_id) {
      match.complex_id = new mongoose.Types.ObjectId(user.complex_id);
    }

    const data = await User.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'complexes',
          localField: 'complex_id',
          foreignField: '_id',
          as: 'complex'
        }
      },
      { $unwind: '$complex' },
      {
        $group: {
          _id: '$complex._id',
          complejo: { $first: '$complex.name' },
          residentes: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          complejo: 1,
          residentes: 1
        }
      }
    ]);

    res.json(data);

  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo residentes' });
  }
};

export const getHousesByComplex = async (req: Request, res: Response) => {
  try {

    const user = req.user;

    let match: any = {};

    if (user?.role === 'admin' && user.complex_id) {
      match.complex_id = new mongoose.Types.ObjectId(user.complex_id);
    }

    const data = await House.aggregate([
      { $match: match }, // 👈 AQUÍ aplicas el filtro
      {
        $lookup: {
          from: 'complexes',
          localField: 'complex_id',
          foreignField: '_id',
          as: 'complex'
        }
      },
      { $unwind: '$complex' },
      {
        $group: {
          _id: '$complex._id',
          complejo: { $first: '$complex.name' },
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          complejo: 1,
          total: 1
        }
      }
    ]);

    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo casas por complejo' });
  }
};