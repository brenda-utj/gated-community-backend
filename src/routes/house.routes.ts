import { Router } from "express";
import * as HouseController from "../controllers/house.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import House from "../models/House";

const router = Router();

// Rutas para Residentes (Gestionan su propia información)
router.get(
  "/my-house",
  authenticate,
  authorize(["resident"]),
  HouseController.getMyHouse,
);
router.post(
  "/my-house/vehicles",
  authenticate,
  authorize(["resident"]),
  HouseController.addVehicle,
);
router.delete(
  "/my-house/vehicles/:vehicleId",
  authenticate,
  authorize(["resident"]),
  HouseController.deleteVehicle,
);

router.post(
  "/my-house/pets",
  authenticate,
  authorize(["resident"]),
  HouseController.addPet,
);

// Rutas para Admin (Consulta global)
router.get(
  "/all",
  authenticate,
  authorize(["admin"]),
  async (req: any, res) => {
    const houses = await House.find({ complex_id: req.user.complex_id });
    res.json(houses);
  },
);

export default router;
