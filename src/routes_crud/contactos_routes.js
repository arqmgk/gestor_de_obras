import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { getContactos, addContacto, updateContacto, deleteContacto } from '../controllers/contactosController.js';

const router = Router();
router.use(authenticate);

router.get('/obra/:obraId',    getContactos);
router.post('/obra/:obraId',   addContacto);
router.put('/:id',             updateContacto);
router.delete('/:id',          deleteContacto);

export default router;
