import pool from '../config/db.js';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Carpeta donde se guardan las fotos: /uploads/fotos/ en la raíz del proyecto
const UPLOADS_DIR = path.join(__dirname, '../../uploads/fotos');

// Asegurar que la carpeta existe al arrancar
await fs.mkdir(UPLOADS_DIR, { recursive: true });

// URL base para servir las fotos (ajustar si cambia el puerto)
const BASE_URL = process.env.BASE_URL || 'http://localhost:8000';

// ── SUBIR FOTO ────────────────────────────────────────────────────────────────
export const subirFoto = async (req, res, next) => {
  try {
    const taskId = Number(req.params.id);
    if (isNaN(taskId)) return res.status(400).json({ error: 'taskId inválido' });

    if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' });

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!tiposPermitidos.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Tipo de archivo no permitido. Usar JPG, PNG o WebP' });
    }

    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'La imagen no puede superar 10MB' });
    }

    const taskCheck = await pool.query('SELECT id FROM tasks WHERE id = $1', [taskId]);
    if (taskCheck.rows.length === 0) return res.status(404).json({ error: 'Tarea no encontrada' });

    // Guardar en disco
    const ext      = path.extname(req.file.originalname) || '.jpg';
    const filename = `${randomUUID()}${ext}`;
    const filepath = path.join(UPLOADS_DIR, filename);
    await fs.writeFile(filepath, req.file.buffer);

    const key = `fotos/${filename}`;
    const url = `${BASE_URL}/uploads/fotos/${filename}`;

    const latitud     = req.body.latitud   ? parseFloat(req.body.latitud)   : null;
    const longitud    = req.body.longitud  ? parseFloat(req.body.longitud)  : null;
    const descripcion = req.body.descripcion || null;
    const timestamp   = req.body.timestamp ? new Date(req.body.timestamp)  : new Date();

    const result = await pool.query(
      `INSERT INTO fotos (task_id, url, key, latitud, longitud, timestamp, descripcion, subida_por)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [taskId, url, key, latitud, longitud, timestamp, descripcion, req.user?.id || null]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Error subiendo foto:', error);
    next(error);
  }
};

// ── LISTAR FOTOS DE UNA TAREA ─────────────────────────────────────────────────
export const getFotos = async (req, res, next) => {
  try {
    const taskId = Number(req.params.id);
    if (isNaN(taskId)) return res.status(400).json({ error: 'taskId inválido' });

    const result = await pool.query(
      `SELECT f.*, u.nombre AS subida_por_nombre
       FROM fotos f
       LEFT JOIN usuarios u ON u.id = f.subida_por
       WHERE f.task_id = $1
       ORDER BY f.timestamp DESC`,
      [taskId]
    );

    res.json(result.rows);
  } catch (error) { next(error); }
};

// ── LISTAR FOTOS DE UNA OBRA ──────────────────────────────────────────────────
export const getFotosByObra = async (req, res, next) => {
  try {
    const obraId = Number(req.params.obraId);
    if (isNaN(obraId)) return res.status(400).json({ error: 'obraId inválido' });

    const result = await pool.query(
      `SELECT f.*, t.titulo AS task_titulo, u.nombre AS subida_por_nombre
       FROM fotos f
       JOIN tasks t ON t.id = f.task_id
       LEFT JOIN usuarios u ON u.id = f.subida_por
       WHERE t.obra_id = $1
       ORDER BY f.timestamp DESC`,
      [obraId]
    );

    res.json(result.rows);
  } catch (error) { next(error); }
};

// ── ELIMINAR FOTO ─────────────────────────────────────────────────────────────
export const deleteFoto = async (req, res, next) => {
  try {
    const fotoId = Number(req.params.fotoId);
    if (isNaN(fotoId)) return res.status(400).json({ error: 'fotoId inválido' });

    const fotoRes = await pool.query('SELECT * FROM fotos WHERE id = $1', [fotoId]);
    if (fotoRes.rows.length === 0) return res.status(404).json({ error: 'Foto no encontrada' });

    const foto = fotoRes.rows[0];

    // Borrar archivo del disco
    try {
      const filename = path.basename(foto.key);
      await fs.unlink(path.join(UPLOADS_DIR, filename));
    } catch {
      // Si el archivo no existe igual borramos el registro
    }

    await pool.query('DELETE FROM fotos WHERE id = $1', [fotoId]);

    res.json({ message: 'Foto eliminada' });
  } catch (error) { next(error); }
};
