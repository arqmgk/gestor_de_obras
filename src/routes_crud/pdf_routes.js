import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { generarCertificadoTask, generarCertificadoObra } from '../controllers/pdfController.js';

const router = Router();

router.use(authenticate);

// Certificado individual por tarea + pago
router.get('/certificado/task/:id/pago/:pagoId', generarCertificadoTask);

// Resumen de certificaciones por obra
router.get('/certificado/obra/:id', generarCertificadoObra);

export default router;
