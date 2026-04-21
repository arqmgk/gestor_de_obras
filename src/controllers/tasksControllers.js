import pool from '../config/db.js';

export const getTasks = async (req, res, next) => {
    try {
        const { estado, obraId } = req.query;

        let query = 'SELECT * FROM tasks';
        let values = [];

        if (estado && obraId) {
            query += ' WHERE estado = $1 AND obra_id = $2';
            values.push(estado, Number(obraId));
        } else if (estado) {
            query += ' WHERE estado = $1';
            values.push(estado);
        } else if (obraId) {
            query += ' WHERE obra_id = $1';
            values.push(Number(obraId));
        }

        const result = await pool.query(query, values);
        res.json(result.rows);

    } catch (error) {
        next(error);
    }
};

export const getTask = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        const result = await pool.query(
            'SELECT * FROM tasks WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            const error = new Error('Task not found');
            error.status = 404;
            return next(error);
        }

        res.json(result.rows[0]);

    } catch (error) {
        next(error);
    }
};

export const createTask = async (req, res, next) => {
    try {
        const {
            titulo,
            estado,
            obraId,
            prioridad,
            fecha_inicio,
            fecha_fin,
            responsable,
            unidad,
            cantidad_total
        } = req.body;

        if (!titulo) {
            const error = new Error('Falta título');
            error.status = 400;
            return next(error);
        }

        if (!unidad) {
            const error = new Error('Falta unidad');
            error.status = 400;
            return next(error);
        }

        if (fecha_inicio && fecha_fin && fecha_inicio > fecha_fin) {
            const error = new Error('Fecha fin no puede ser menor a inicio');
            error.status = 400;
            return next(error);
        }

        if (!cantidad_total || cantidad_total <= 0) {
            const error = new Error('Cantidad total inválida');
            error.status = 400;
            return next(error);
        }

        const result = await pool.query(
            `INSERT INTO tasks (
                titulo, estado, obra_id, prioridad,
                fecha_inicio, fecha_fin, responsable,
                unidad, cantidad_total
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *`,
            [
                titulo,
                estado || 'pendiente',
                obraId,
                prioridad || 'media',
                fecha_inicio,
                fecha_fin,
                responsable,
                unidad,
                cantidad_total
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        next(error);
    }
};

export const updateTask = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const {
            titulo, estado, obraId, prioridad,
            fecha_inicio, fecha_fin, responsable,
            unidad, cantidad_total
        } = req.body;

        if (!titulo) {
            const error = new Error('Falta título');
            error.status = 400;
            return next(error);
        }

        if (!unidad) {
            const error = new Error('Falta unidad');
            error.status = 400;
            return next(error);
        }

        if (fecha_inicio && fecha_fin && fecha_inicio > fecha_fin) {
            const error = new Error('Fecha fin no puede ser menor a inicio');
            error.status = 400;
            return next(error);
        }

        const result = await pool.query(
            `UPDATE tasks
             SET titulo = $1, estado = $2, obra_id = $3,
                 prioridad = $4, fecha_inicio = $5, fecha_fin = $6,
                 responsable = $7, unidad = $8, cantidad_total = $9
             WHERE id = $10
             RETURNING *`,
            [titulo, estado, obraId, prioridad, fecha_inicio, fecha_fin,
             responsable, unidad, cantidad_total ?? 0, id]
        );

        if (result.rows.length === 0) {
            const error = new Error('Tarea no encontrada');
            error.status = 404;
            return next(error);
        }

        res.json(result.rows[0]);

    } catch (error) {
        next(error);
    }
};

export const deleteTask = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        const result = await pool.query(
            'DELETE FROM tasks WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            const error = new Error('Task not found');
            error.status = 404;
            return next(error);
        }

        res.json(result.rows[0]);

    } catch (error) {
        next(error);
    }
};

export const getTasksByObra = async (req, res, next) => {
  try {
    const obraId = Number(req.params.id);

    const result = await pool.query(
      'SELECT * FROM tasks WHERE obra_id = $1',
      [obraId]
    );

    res.json(result.rows);

  } catch (error) {
    next(error);
  }
};

export const getProgresoTask = async (req, res, next) => {
    try {
        const taskId = Number(req.params.id);

        const result = await pool.query(`
            SELECT
                t.id, t.titulo, t.unidad,
                COALESCE(t.cantidad_total,0) AS cantidad_total,
                COALESCE(SUM(m.cantidad),0) AS ejecutado,
                CASE
                    WHEN COALESCE(t.cantidad_total,0) = 0 THEN 0
                    ELSE COALESCE(SUM(m.cantidad),0) * 100.0 / COALESCE(t.cantidad_total,1)
                END AS progreso
            FROM tasks t
            LEFT JOIN mediciones m ON t.id = m.task_id
            WHERE t.id = $1
            GROUP BY t.id, t.titulo, t.unidad, t.cantidad_total
        `, [taskId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Task no encontrada' });
        }

        res.json(result.rows[0]);

    } catch (error) {
        next(error);
    }
};

export const addMedicion = async (req, res, next) => {
    try {
        const taskId = Number(req.params.id);
        const { cantidad, observaciones } = req.body;

        if (cantidad === undefined || cantidad === null) {
            const error = new Error('Falta cantidad');
            error.status = 400;
            return next(error);
        }

        const totalRes = await pool.query(
            'SELECT cantidad_total FROM tasks WHERE id = $1',
            [taskId]
        );

        const ejecutadoRes = await pool.query(
            'SELECT COALESCE(SUM(cantidad),0) as total FROM mediciones WHERE task_id = $1',
            [taskId]
        );

        const total = totalRes.rows[0]?.cantidad_total || 0;
        const ejecutado = Number(ejecutadoRes.rows[0]?.total) || 0;

        if (total > 0 && (ejecutado + cantidad > total)) {
            const error = new Error('Supera la cantidad total de la tarea');
            error.status = 400;
            return next(error);
        }

        const result = await pool.query(
            `INSERT INTO mediciones (task_id, cantidad, observaciones)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [taskId, cantidad, observaciones || null]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        next(error);
    }
};

export const getMediciones = async (req, res, next) => {
    try {
        const taskId = Number(req.params.id);

        const result = await pool.query(
            'SELECT * FROM mediciones WHERE task_id = $1 ORDER BY fecha ASC',
            [taskId]
        );

        res.json(result.rows);

    } catch (error) {
        next(error);
    }
};