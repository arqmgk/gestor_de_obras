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
            LEFT JOIN (
                SELECT task_id, SUM(cantidad) AS cantidad
                FROM mediciones
                GROUP BY task_id
            ) m ON t.id = m.task_id
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
            cantidad_total,
            precio_unitario
        } = req.body;

        const cantidadTotalNum = Number(cantidad_total);
        const precioUnitarioNum = precio_unitario != null && precio_unitario !== '' ? Number(precio_unitario) : null;

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

        if (precioUnitarioNum !== null && (isNaN(precioUnitarioNum) || precioUnitarioNum < 0)) {
            return res.status(400).json({ error: 'Precio unitario inválido' });
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
                unidad, cantidad_total, precio_unitario
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
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
                precioUnitarioNum
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
            cantidad_total,
            precio_unitario
        } = req.body;

        const cantidadTotalNum = Number(cantidad_total);
        const precioUnitarioNum = precio_unitario != null && precio_unitario !== '' ? Number(precio_unitario) : null;

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
                 cantidad_total = $9,
                 precio_unitario = $10
             WHERE id = $11
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
                precioUnitarioNum,
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
                COALESCE(agg.ejecutado, 0)::float AS ejecutado,
                ROUND(
                    CASE
                        WHEN COALESCE(t.cantidad_total, 0) = 0 THEN 0
                        ELSE LEAST(COALESCE(agg.ejecutado, 0) * 100.0 / t.cantidad_total, 100)
                    END
                , 2)::float AS progreso
             FROM tasks t
             LEFT JOIN (
               SELECT task_id, SUM(cantidad) AS ejecutado
               FROM mediciones
               GROUP BY task_id
             ) agg ON t.id = agg.task_id
             WHERE t.id = $1`,
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
        const { cantidad, observaciones, fecha } = req.body;

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
                error: `Supera la cantidad total. Máximo restante: ${(total - ejecutado).toFixed(2)}`
            });
        }

        const result = await pool.query(
            `INSERT INTO mediciones (task_id, cantidad, observaciones, fecha)
             VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE))
             RETURNING *`,
            [taskId, cantidadNum, observaciones || null, fecha || null]
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

// ── PAGOS / CERTIFICADOS ──────────────────────────────────────────────────────

export const getPagos = async (req, res, next) => {
    try {
        const taskId = Number(req.params.id);
        if (isNaN(taskId)) return res.status(400).json({ error: 'taskId inválido' });

        const result = await pool.query(
            `SELECT
                p.id,
                p.task_id,
                p.cantidad_certificada::float,
                p.monto::float,
                p.tipo,
                p.estado,
                p.observaciones,
                p.fecha_emision,
                p.fecha_pago,
                p.created_at,
                p.precio_base::float,
                p.indice_aplicado::float,
                p.mes_indice,
                p.coeficiente::float,
                p.fuente_indice,
                SUM(p.monto) OVER (
                    PARTITION BY p.task_id
                    ORDER BY p.fecha_emision ASC, p.id ASC
                )::float AS acumulado_monto,
                SUM(p.cantidad_certificada) OVER (
                    PARTITION BY p.task_id
                    ORDER BY p.fecha_emision ASC, p.id ASC
                )::float AS acumulado_cantidad
             FROM pagos p
             WHERE p.task_id = $1
             ORDER BY p.fecha_emision ASC, p.id ASC`,
            [taskId]
        );

        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

export const addPago = async (req, res, next) => {
    try {
        const taskId = Number(req.params.id);
        const {
            cantidad_certificada,
            monto,
            tipo,
            observaciones,
            fecha_emision,
            indice_aplicado,
            mes_indice,
            coeficiente,
            precio_base,
            fuente_indice,
        } = req.body;

        const cantNum        = Number(cantidad_certificada);
        const montoNum       = Number(monto);
        const coefNum        = coeficiente != null && coeficiente !== '' ? Number(coeficiente) : null;
        const indiceNum      = indice_aplicado != null && indice_aplicado !== '' ? Number(indice_aplicado) : null;
        const precioBaseNum  = precio_base != null && precio_base !== '' ? Number(precio_base) : null;

        // Normalizar mes_indice al primer día del mes si viene como YYYY-MM
        let mesIndiceNorm = null;
        if (mes_indice) {
            const m = new Date(mes_indice);
            m.setDate(1);
            mesIndiceNorm = isNaN(m) ? null : m.toISOString().slice(0, 10);
        }

        if (isNaN(taskId))                          return res.status(400).json({ error: 'taskId inválido' });
        if (isNaN(cantNum)  || cantNum  <= 0)       return res.status(400).json({ error: 'Cantidad certificada inválida' });
        if (isNaN(montoNum) || montoNum <= 0)       return res.status(400).json({ error: 'Monto inválido' });

        const tiposValidos = ['anticipo', 'certificado', 'final'];
        if (!tiposValidos.includes(tipo))           return res.status(400).json({ error: 'Tipo inválido. Usar: anticipo, certificado, final' });

        const taskCheck = await pool.query('SELECT id FROM tasks WHERE id = $1', [taskId]);
        if (taskCheck.rows.length === 0)            return res.status(404).json({ error: 'Tarea no encontrada' });

        const result = await pool.query(
            `INSERT INTO pagos
                (task_id, cantidad_certificada, monto, tipo, observaciones, fecha_emision, estado,
                 precio_base, indice_aplicado, mes_indice, coeficiente, fuente_indice)
             VALUES ($1,$2,$3,$4,$5, COALESCE($6::date, CURRENT_DATE),'pendiente', $7,$8,$9,$10,$11)
             RETURNING *`,
            [taskId, cantNum, montoNum, tipo, observaciones || null, fecha_emision || null,
             precioBaseNum, indiceNum, mesIndiceNorm, coefNum, fuente_indice?.trim() || null]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const marcarPagado = async (req, res, next) => {
    try {
        const pagoId = Number(req.params.pagoId);
        const { fecha_pago } = req.body;

        if (isNaN(pagoId)) return res.status(400).json({ error: 'pagoId inválido' });

        const result = await pool.query(
            `UPDATE pagos
             SET estado = 'pagado',
                 fecha_pago = COALESCE($2::date, CURRENT_DATE)
             WHERE id = $1 AND estado = 'pendiente'
             RETURNING *`,
            [pagoId, fecha_pago || null]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'Certificado no encontrado o ya estaba pagado' });

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

export const deletePago = async (req, res, next) => {
    try {
        const pagoId = Number(req.params.pagoId);
        if (isNaN(pagoId)) return res.status(400).json({ error: 'pagoId inválido' });

        const result = await pool.query(
            'DELETE FROM pagos WHERE id = $1 RETURNING *',
            [pagoId]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'Certificado no encontrado' });

        res.json({ message: 'Certificado eliminado', pago: result.rows[0] });
    } catch (error) {
        next(error);
    }
};
