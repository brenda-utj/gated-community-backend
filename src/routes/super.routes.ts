import { Router } from 'express';
import { createComplexWithAdmin, deleteComplex, getComplexes, updateComplex } from '../controllers/superadmin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

// Obtener la lista de fraccionamientos
router.get(
  '/complexes',
  authenticate(),
  authorize(['super_admin']),
  getComplexes // <-- Agregamos esta función
);

// Endpoint para crear un fraccionamiento y su primer administrador
router.post(
  '/complexes', 
  authenticate(), 
  authorize(['super_admin']), 
  createComplexWithAdmin
);

// ... otros imports

// Ruta para actualizar un fraccionamiento por ID
router.patch(
  '/complexes/:id',
  authenticate(),
  authorize(['super_admin']),
  updateComplex
);

router.delete('/complexes/:id', authenticate(), authorize(['super_admin']), deleteComplex);

export default router;