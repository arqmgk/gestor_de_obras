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
    getMediciones,
    getPagos,
    addPago,
    marcarPagado,
    deletePago
} from '../controllers/tasksControllers.js';

const router = Router();

router.use(authenticate);

// MEDICIONES
router.get('/:id/mediciones', getMediciones);
router.post('/:id/mediciones', addMedicion);

// CERTIFICADOS / PAGOS
router.get('/:id/pagos', getPagos);
router.post('/:id/pagos', addPago);
router.patch('/:id/pagos/:pagoId/pagar', marcarPagado);
router.delete('/:id/pagos/:pagoId', deletePago);

// PROGRESO
router.get('/:id/progreso', getProgresoTask);

// CRUD
router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
