import express from 'express';
import {
  getObras,
  getObraById,
  createObra,
  deleteObra,
  getProgresoObra,
  getTasksWithProgreso
} from '../controllers/obrasController.js';

const router = express.Router();

router.get('/', getObras);
router.get('/:id', getObraById);
router.post('/', createObra);
router.delete('/:id', deleteObra);

// progreso
router.get('/:id/progreso', getProgresoObra);

// tasks con progreso
router.get('/:id/tasks', getTasksWithProgreso);

export default router;
