import { Router } from 'express';
import {
    getObras,
    getObra,
    createObra,
    updateObra,
    deleteObra,
    getProgresoObra
} from '../controllers/obrasController.js';

import { getTasksByObra } from '../controllers/tasksControllers.js';

const router = Router();

router.get('/', getObras);
router.post('/', createObra);

//GET por avance de obra
router.get('/:id/progreso', getProgresoObra);


// relación
router.get('/:id/tasks', getTasksByObra);

// CRUD individual
router.get('/:id', getObra);
router.put('/:id', updateObra);
router.delete('/:id', deleteObra);

export default router;
