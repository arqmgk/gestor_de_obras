import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  getObras,
  getObraById,
  createObra,
  updateObra,
  deleteObra,
  getProgresoObra,
  getTasksWithProgreso,
  getFlujoPorMes
} from '../controllers/obrasController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getObras);
router.post('/', createObra);

router.get('/:id/progreso', getProgresoObra);
router.get('/:id/tasks', getTasksWithProgreso);
router.get('/:id/flujo', getFlujoPorMes);

router.get('/:id', getObraById);
router.put('/:id', updateObra);
router.delete('/:id', deleteObra);

export default router;
