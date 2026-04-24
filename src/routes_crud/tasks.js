import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    getProgresoTask,
    addMedicion,
    getMediciones
} from '../controllers/tasksControllers.js';

const router = Router();

// Todas las rutas requieren token
router.use(authenticate);

// MEDICIONES (antes que :id)
router.get('/:id/mediciones', getMediciones);
router.post('/:id/mediciones', addMedicion);

// PROGRESO
router.get('/:id/progreso', getProgresoTask);

// CRUD
router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
