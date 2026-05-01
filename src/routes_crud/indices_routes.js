import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { getIndices, getUltimosIndices, addIndice, deleteIndice, aplicarCoeficiente } from '../controllers/indicesController.js';

const router = Router();
router.use(authenticate);

router.get('/',          getIndices);
router.get('/ultimos',   getUltimosIndices);
router.post('/',         addIndice);
router.delete('/:id',    deleteIndice);
router.post('/aplicar',  aplicarCoeficiente);

export default router;
