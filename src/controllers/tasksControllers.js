import pool from '../config/db.js';

export const getTasks = async (req, res, next) => {
    try {
        const { estado, obraId } = req.query;

        let query = `
            SELECT 
                t.id,
                t.titulo,
                t.estado,
                t.obra_id,
                t.unidad,
                t.prioridad,
                t.fecha_inicio,
                t.fecha_fin,
                t.responsable,
                t.cantidad_total::float,
                COALESCE(SUM(m.cantidad),0)::float AS cantidad_ejecutada,
                CASE 
                    WHEN t.cantidad_total = 0 THEN 0
                    ELSE COALESCE(SUM(m.cantidad),0) * 100.0 / t.cantidad_total
                END AS progreso
            FROM tasks t
            LEFT JOIN mediciones m ON t.id = m.task_id
        `;

        let values = [];
        let conditions = [];

        if (estado) {
            conditions.push(`t.estado = $${values.length + 1}`);
            values.push(estado);
        }

        if (obraId) {
            conditions.push(`t.obra_id = $${values.length + 1}`);
            values.push(Number(obraId));
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += `
            GROUP BY t.id
            ORDER BY t.id DESC
        `;

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
            `SELECT 
                t.id,
                t.titulo,
                t.estado,
                t.obra_id,
                t.unidad,
                t.cantidad_total::float
             FROM tasks t
             WHERE t.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task no encontrada' });
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

        const cantidadTotalNum = Number(cantidad_total);

        if (!titulo) {
            return res.status(400).json({ error: 'Falta título' });
        }

        if (!unidad) {
            return res.status(400).json({ error: 'Falta unidad' });
        }

        if (!obraId) {
            return res.status(400).json({ error: 'Falta obraId' });
        }

        if (isNaN(cantidadTotalNum) || cantidadTotalNum <= 0) {
            return res.status(400).json({ error: 'Cantidad total inválida' });
        }

        if (fecha_inicio && fecha_fin && fecha_inicio > fecha_fin) {
            return res.status(400).json({ error: 'Fecha fin no puede ser menor a inicio' });
        }

        // ✅ Validar que la obra exista
        const obraCheck = await pool.query(
            'SELECT id FROM obras WHERE id = $1',
            [obraId]
        );

        if (obraCheck.rows.length === 0) {
            return res.status(400).json({ error: 'La obra no existe' });
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
                cantidadTotalNum
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        next(error);
    }
};


export const updateTask = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

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

        const cantidadTotalNum = Number(cantidad_total);

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        if (!titulo) {
            return res.status(400).json({ error: 'Falta título' });
        }

        if (!unidad) {
            return res.status(400).json({ error: 'Falta unidad' });
        }

        if (!obraId) {
            return res.status(400).json({ error: 'Falta obraId' });
        }

        if (isNaN(cantidadTotalNum) || cantidadTotalNum <= 0) {
            return res.status(400).json({ error: 'Cantidad total inválida' });
        }

        if (fecha_inicio && fecha_fin && fecha_inicio > fecha_fin) {
            return res.status(400).json({
                error: 'Fecha fin no puede ser menor a inicio'
            });
        }

        // ✅ Validar que la obra exista
        const obraCheck = await pool.query(
            'SELECT id FROM obras WHERE id = $1',
            [obraId]
        );

        if (obraCheck.rows.length === 0) {
            return res.status(400).json({ error: 'La obra no existe' });
        }

        const result = await pool.query(
            `UPDATE tasks
             SET titulo = $1,
                 estado = $2,
                 obra_id = $3,
                 prioridad = $4,
                 fecha_inicio = $5,
                 fecha_fin = $6,
                 responsable = $7,
                 unidad = $8,
                 cantidad_total = $9
             WHERE id = $10
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
                cantidadTotalNum,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        

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

        if (isNaN(taskId)) {
            return res.status(400).json({ error: 'taskId inválido' });
        }

        const result = await pool.query(
            `SELECT
                t.id,
                t.titulo,
                t.unidad,
                COALESCE(t.cantidad_total, 0)::float AS cantidad_total,
                COALESCE(SUM(m.cantidad), 0)::float AS ejecutado,
                ROUND(
                    CASE
                        WHEN COALESCE(t.cantidad_total, 0) = 0 THEN 0
                        ELSE COALESCE(SUM(m.cantidad), 0) * 100.0 / t.cantidad_total
                    END
                , 2)::float AS progreso
             FROM tasks t
             LEFT JOIN mediciones m ON t.id = m.task_id
             WHERE t.id = $1
             GROUP BY t.id, t.titulo, t.unidad, t.cantidad_total`,
            [taskId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        next(error);
    }
};


export const addMedicion = async (req, res, next) => {
    try {
        const taskId = Number(req.params.id);
        const { cantidad, observaciones } = req.body;

        const cantidadNum = Number(cantidad);

        if (isNaN(taskId)) {
            return res.status(400).json({ error: 'taskId inválido' });
        }

        if (isNaN(cantidadNum) || cantidadNum <= 0) {
            return res.status(400).json({ error: 'Cantidad inválida' });
        }

        // Obtener cantidad_total de la tarea
        const totalRes = await pool.query(
            'SELECT cantidad_total FROM tasks WHERE id = $1',
            [taskId]
        );

        if (totalRes.rows.length === 0) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        const total = Number(totalRes.rows[0].cantidad_total) || 0;

        // Obtener ejecutado actual
        const ejecutadoRes = await pool.query(
            'SELECT COALESCE(SUM(cantidad),0) AS total FROM mediciones WHERE task_id = $1',
            [taskId]
        );

        const ejecutado = Number(ejecutadoRes.rows[0].total) || 0;

        // Validar que no supere el total
        if (total > 0 && (ejecutado + cantidadNum > total)) {
            return res.status(400).json({
                error: 'Supera la cantidad total de la tarea'
            });
        }

        // Insertar medición (SIN acumulado)
        const result = await pool.query(
            `INSERT INTO mediciones (task_id, cantidad, observaciones)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [taskId, cantidadNum, observaciones || null]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        next(error);
    }
};



export const getMediciones = async (req, res, next) => {
    try {
        const taskId = Number(req.params.id);

        if (isNaN(taskId)) {
            return res.status(400).json({ error: 'taskId inválido' });
        }

        const result = await pool.query(
            `SELECT 
                m.id,
                m.task_id,
                m.fecha,
                m.cantidad::float,
                m.observaciones,
                m.created_at,
                SUM(m.cantidad) OVER (
                    PARTITION BY m.task_id
                    ORDER BY m.fecha ASC, m.id ASC
                )::float AS acumulado
             FROM mediciones m
             WHERE m.task_id = $1
             ORDER BY m.fecha ASC, m.id ASC`,
            [taskId]
        );

        res.json(result.rows);

    } catch (error) {
        next(error);
    }
};
