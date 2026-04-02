import express from 'express';
import { getHousesByComplex, getResidentsByComplex } from '../controllers/dashboard.controller.js';

const router = express.Router();

router.get('/houses-by-complex', getHousesByComplex);
router.get('/residents-by-complex', getResidentsByComplex);

export default router;