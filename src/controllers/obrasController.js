import pool from '../config/db.js';

// GET obras
export const getObras = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM obras ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

// GET obra por ID (con tasks)
export const getObraById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const obra = await pool.query('SELECT * FROM obras WHERE id = $1', [id]);

    const tasks = await pool.query(
      'SELECT * FROM tasks WHERE obra_id = $1 ORDER BY id DESC',
      [id]
    );

    res.json({
      ...obra.rows[0],
      tasks: tasks.rows
    });

  } catch (error) {
    next(error);
  }
};

// POST crear obra
export const createObra = async (req, res, next) => {
  try {
    const { nombre, direccion, estado, fecha_inicio, fecha_fin } = req.body;

    const result = await pool.query(`
      INSERT INTO obras (nombre, direccion, estado, fecha_inicio, fecha_fin)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [nombre, direccion, estado, fecha_inicio, fecha_fin]);

    res.status(201).json(result.rows[0]);

  } catch (error) {
    next(error);
  }
};

// DELETE obra
export const deleteObra = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    await pool.query('DELETE FROM obras WHERE id = $1', [id]);

    res.json({ message: 'Obra eliminada' });

  } catch (error) {
    next(error);
  }
};

// PROGRESO OBRA
export const getProgresoObra = async (req, res, next) => {
  try {
    const obraId = Number(req.params.id);

    const result = await pool.query(`
      SELECT 
        COALESCE(SUM(t.cantidad_total),0) AS total,
        COALESCE(SUM(m.cantidad),0) AS ejecutado,
        CASE 
          WHEN COALESCE(SUM(t.cantidad_total),0) = 0 THEN 0
          ELSE COALESCE(SUM(m.cantidad),0) * 100.0 / SUM(t.cantidad_total)
        END AS progreso
      FROM tasks t
      LEFT JOIN mediciones m ON t.id = m.task_id
      WHERE t.obra_id = $1
    `, [obraId]);

    res.json(result.rows[0]);

  } catch (error) {
    next(error);
  }
};

// TASKS CON PROGRESO
export const getTasksWithProgreso = async (req, res, next) => {
  try {
    const obraId = Number(req.params.id);

    const result = await pool.query(`
      SELECT 
        t.*,
        COALESCE(SUM(m.cantidad), 0) AS ejecutado,
        CASE 
          WHEN COALESCE(t.cantidad_total,0) = 0 THEN 0
          ELSE COALESCE(SUM(m.cantidad),0) * 100.0 / t.cantidad_total
        END AS progreso
      FROM tasks t
      LEFT JOIN mediciones m ON t.id = m.task_id
      WHERE t.obra_id = $1
      GROUP BY t.id
    `, [obraId]);

    res.json(result.rows);

  } catch (error) {
    next(error);
  }
};
