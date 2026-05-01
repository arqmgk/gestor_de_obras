import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/authenticate.js';
import { subirFoto, getFotos, getFotosByObra, deleteFoto } from '../controllers/fotosController.js';

// Multer con memoria (el buffer se pasa directo a R2)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = Router();
router.use(authenticate);

// Por tarea
router.get('/task/:id',             getFotos);
router.post('/task/:id',            upload.single('foto'), subirFoto);
router.delete('/task/:id/:fotoId',  deleteFoto);

// Por obra (galería completa)
router.get('/obra/:obraId',         getFotosByObra);

export default router;
