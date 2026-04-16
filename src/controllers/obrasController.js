import pool from '../config/db.js';


// 🟢 GET todas las obras (con filtros opcionales)
export const getObras = async (req, res, next) => {
    try {
        const { estado } = req.query;

        let query = 'SELECT * FROM obras';
        let values = [];

        if (estado) {
            query += ' WHERE estado = $1';
            values.push(estado);
        }

        const result = await pool.query(query, values);

        res.json(result.rows);

    } catch (error) {
        next(error);
    }
};


// 🟢 GET obra por id
export const getObra = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        // 🔹 obra
        const obraResult = await pool.query(
            'SELECT * FROM obras WHERE id = $1',
            [id]
        );

        if (obraResult.rows.length === 0) {
            return res.status(404).json({ message: 'Obra no encontrada' });
        }

        // 🔹 tareas
        const tasksResult = await pool.query(
            'SELECT * FROM tasks WHERE obra_id = $1',
            [id]
        );

        // 🔹 progreso general de la obra
        const progresoResult = await pool.query(
            `SELECT 
                CASE 
                    WHEN COUNT(*) = 0 THEN 0
                    ELSE COUNT(*) FILTER (WHERE estado = 'terminado') * 100.0 / COUNT(*)
                END AS progreso
             FROM tasks
             WHERE obra_id = $1`,
            [id]
        );

        // 🔥 UNA sola respuesta (esto es clave)
        res.json({
            ...obraResult.rows[0],
            tasks: tasksResult.rows, // 👈 frontend usa esto
            progreso: Number(progresoResult.rows[0].progreso)
        });

    } catch (error) {
        next(error);
    }
};


// 🟢 POST crear obra
export const createObra = async (req, res, next) => {
    try {
        const { nombre, direccion, estado, fecha_inicio, fecha_fin } = req.body;

        if (!nombre) {
            const error = new Error('Falta nombre');
            error.status = 400;
            return next(error);
        }

        if (fecha_inicio && fecha_fin && fecha_inicio > fecha_fin) {
            const error = new Error('Fecha fin no puede ser menor a inicio');
            error.status = 400;
            return next(error);
        }

        const result = await pool.query(
            `INSERT INTO obras (nombre, direccion, estado, fecha_inicio, fecha_fin)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [nombre, direccion, estado || 'planificada', fecha_inicio, fecha_fin]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        next(error);
    }
};


// 🟡 PUT actualizar obra
export const updateObra = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const { nombre, direccion, estado, fecha_inicio, fecha_fin } = req.body;

        if (!nombre) {
            const error = new Error('Falta nombre');
            error.status = 400;
            return next(error);
        }

        if (fecha_inicio && fecha_fin && fecha_inicio > fecha_fin) {
            const error = new Error('Fecha fin no puede ser menor a inicio');
            error.status = 400;
            return next(error);
        }

        const result = await pool.query(
            `UPDATE obras
             SET nombre = $1,
                 direccion = $2,
                 estado = $3,
                 fecha_inicio = $4,
                 fecha_fin = $5
             WHERE id = $6
             RETURNING *`,
            [nombre, direccion, estado, fecha_inicio, fecha_fin, id]
        );

        if (result.rows.length === 0) {
            const error = new Error('Obra no encontrada');
            error.status = 404;
            return next(error);
        }

        res.json(result.rows[0]);

    } catch (error) {
        next(error);
    }
};


// 🔴 DELETE obra
export const deleteObra = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        const result = await pool.query(
            'DELETE FROM obras WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            const error = new Error('Obra no encontrada');
            error.status = 404;
            return next(error);
        }

        res.json(result.rows[0]);

    } catch (error) {
        next(error);
    }
};


// obtener progreso obra

export const getProgresoObra = async (req, res, next) => {
    try {
        const obraId = Number(req.params.id);

        const result = await pool.query(
            `
            SELECT 
                CASE 
                    WHEN SUM(t.cantidad_total) = 0 THEN 0
                    ELSE SUM(COALESCE(m.total,0)) * 100.0 / SUM(t.cantidad_total)
                END AS progreso
            FROM tasks t
            LEFT JOIN (
                SELECT task_id, SUM(cantidad) AS total
                FROM mediciones
                GROUP BY task_id
            ) m ON t.id = m.task_id
            WHERE t.obra_id = $1
            `,
            [obraId]
        );

        res.json({
            obra_id: obraId,
            progreso: Number(result.rows[0].progreso)
        });

    } catch (error) {
        next(error);
    }
};
