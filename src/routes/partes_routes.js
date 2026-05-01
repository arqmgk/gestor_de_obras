import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
    getOrCreateParte,
    getPartesByObra,
    updateParte,
    addPersona,
    deletePersona,
} from '../controllers/parteController.js';

const router = Router();
router.use(authenticate);

// Parte del día (get o crea automáticamente)
// GET /api/partes/obra/:obraId?fecha=2025-04-27
router.get('/obra/:obraId', getOrCreateParte);

// Historial de partes por obra
router.get('/obra/:obraId/historial', getPartesByObra);

// Actualizar observaciones de un parte
router.patch('/:parteId', updateParte);

// Personas
router.post('/:parteId/personas', addPersona);
router.delete('/:parteId/personas/:personaId', deletePersona);

export default router;
