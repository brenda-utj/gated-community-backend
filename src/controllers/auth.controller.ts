import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Find user (and explicitly select password since it might be hidden by default in schema)
    const user = await User.findOne({ email })
    .select("+password") // <--- ¡ESTA LÍNEA ES LA QUE FALTA!
      .populate("complex_id")
      .populate("house_id");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        house_id: user.house_id,
        complex_id: user.complex_id
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    const populatedHouse = user.house_id as any;

    console.log(populatedHouse)

    res.status(200).json({
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        // Info del complejo (útil para Admin, Resident, Security)
        complex: user.complex_id,
        // Info de la casa (solo si es Residente)
        house: populatedHouse ? {
          _id: populatedHouse._id,
          address: `${populatedHouse.street} #${populatedHouse.house_number}`,
          vehicles: populatedHouse.vehicles,
          pets: populatedHouse.pets
        } : null
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
