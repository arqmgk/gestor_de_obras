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

    if (obra.rows.length === 0) {
      const error = new Error('Obra no encontrada');
      error.status = 404;
      return next(error);
    }

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

    const result = await pool.query(
      'DELETE FROM obras WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      const error = new Error('Obra no encontrada');
      error.status = 404;
      return next(error);
    }

    res.json({ message: 'Obra eliminada' });

  } catch (error) {
    next(error);
  }
};

// PUT actualizar obra
export const updateObra = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { nombre, direccion, estado, fecha_inicio, fecha_fin } = req.body;

    const result = await pool.query(`
      UPDATE obras
      SET nombre = $1,
          direccion = $2,
          estado = $3,
          fecha_inicio = $4,
          fecha_fin = $5
      WHERE id = $6
      RETURNING *
    `, [nombre, direccion, estado, fecha_inicio, fecha_fin, id]);

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

// PROGRESO OBRA
export const getProgresoObra = async (req, res, next) => {
  try {
    const obraId = Number(req.params.id);

    // Progreso general: promedio ponderado por presupuesto (si hay precio) o por tarea (si no)
    const general = await pool.query(`
      WITH task_data AS (
        SELECT
          t.id,
          t.unidad,
          t.cantidad_total,
          COALESCE(t.precio_unitario, 0) AS precio_unitario,
          t.cantidad_total * COALESCE(t.precio_unitario, 0) AS presupuesto,
          COALESCE(agg_m.ejecutado, 0) AS ejecutado,
          COALESCE(agg_p.pagado, 0) AS pagado
        FROM tasks t
        LEFT JOIN (
          SELECT task_id, SUM(cantidad) AS ejecutado FROM mediciones GROUP BY task_id
        ) agg_m ON t.id = agg_m.task_id
        LEFT JOIN (
          SELECT task_id, SUM(monto) AS pagado FROM pagos GROUP BY task_id
        ) agg_p ON t.id = agg_p.task_id
        WHERE t.obra_id = $1
      )
      SELECT
        COUNT(*)::int AS total_tareas,
        SUM(presupuesto)::float AS presupuesto_total,
        SUM(ejecutado * precio_unitario)::float AS valor_ejecutado,
        SUM(pagado)::float AS total_pagado,
        ROUND(
          CASE
            WHEN SUM(presupuesto) > 0
              THEN LEAST(SUM(ejecutado * precio_unitario) * 100.0 / SUM(presupuesto), 100)
            WHEN COUNT(*) > 0
              THEN AVG(CASE WHEN cantidad_total = 0 THEN 0
                           ELSE LEAST(ejecutado * 100.0 / cantidad_total, 100) END)
            ELSE 0
          END::numeric, 2
        )::float AS progreso,
        ROUND(
          CASE
            WHEN SUM(presupuesto) > 0
              THEN LEAST(SUM(pagado) * 100.0 / SUM(presupuesto), 100)
            ELSE 0
          END::numeric, 2
        )::float AS progreso_pago
      FROM task_data
    `, [obraId]);

    // Progreso por unidad (físico, sin mezclar unidades)
    const porUnidad = await pool.query(`
      SELECT
        t.unidad,
        SUM(t.cantidad_total)::float AS total,
        COALESCE(SUM(agg.ejecutado), 0)::float AS ejecutado,
        ROUND(
          CASE
            WHEN SUM(t.cantidad_total) = 0 THEN 0
            ELSE COALESCE(SUM(agg.ejecutado), 0) * 100.0 / SUM(t.cantidad_total)
          END::numeric, 2
        )::float AS progreso
      FROM tasks t
      LEFT JOIN (
        SELECT task_id, SUM(cantidad) AS ejecutado FROM mediciones GROUP BY task_id
      ) agg ON t.id = agg.task_id
      WHERE t.obra_id = $1
      GROUP BY t.unidad
      ORDER BY t.unidad
    `, [obraId]);

    res.json({
      general: general.rows[0],
      unidades: porUnidad.rows
    });

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
        COALESCE(agg.ejecutado, 0)::float AS ejecutado,
        ROUND(
          CASE
            WHEN COALESCE(t.cantidad_total, 0) = 0 THEN 0
            ELSE LEAST(COALESCE(agg.ejecutado, 0) * 100.0 / t.cantidad_total, 100)
          END::numeric,
          2
        )::float AS progreso
      FROM tasks t
      LEFT JOIN (
        SELECT task_id, SUM(cantidad) AS ejecutado
        FROM mediciones
        GROUP BY task_id
      ) agg ON t.id = agg.task_id
      WHERE t.obra_id = $1
      ORDER BY t.id DESC
    `, [obraId]);

    res.json(result.rows);

  } catch (error) {
    next(error);
  }
};
// FLUJO DE INVERSIÓN POR MES
export const getFlujoPorMes = async (req, res, next) => {
  try {
    const obraId = Number(req.params.id);

    // Presupuesto total de la obra
    const presRes = await pool.query(`
      SELECT
        COALESCE(SUM(t.cantidad_total * COALESCE(t.precio_unitario, 0)), 0)::float AS presupuesto_total,
        MIN(t.fecha_inicio) AS fecha_inicio_obra,
        MAX(t.fecha_fin)    AS fecha_fin_obra
      FROM tasks t
      WHERE t.obra_id = $1
    `, [obraId]);

    const { presupuesto_total, fecha_inicio_obra, fecha_fin_obra } = presRes.rows[0];

    // Certificados agrupados por mes
    const certRes = await pool.query(`
      SELECT
        TO_CHAR(p.fecha_emision, 'YYYY-MM') AS mes,
        SUM(p.monto)::float AS certificado,
        SUM(CASE WHEN p.estado = 'pagado' THEN p.monto ELSE 0 END)::float AS pagado
      FROM pagos p
      JOIN tasks t ON t.id = p.task_id
      WHERE t.obra_id = $1
      GROUP BY mes
      ORDER BY mes ASC
    `, [obraId]);

    // Curva S teórica: distribución lineal del presupuesto entre fecha_inicio y fecha_fin
    // Si no hay fechas, se omite la curva teórica
    let curvaS = [];
    if (fecha_inicio_obra && fecha_fin_obra && presupuesto_total > 0) {
      const inicio = new Date(fecha_inicio_obra);
      const fin    = new Date(fecha_fin_obra);
      const meses  = [];

      let cursor = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
      const finMes = new Date(fin.getFullYear(), fin.getMonth(), 1);

      while (cursor <= finMes) {
        meses.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`);
        cursor.setMonth(cursor.getMonth() + 1);
      }

      const totalMeses = meses.length;
      // Distribución con forma de S: más lento al inicio y al final
      // Usamos distribución normal acumulada simplificada
      curvaS = meses.map((mes, i) => {
        const x = (i + 0.5) / totalMeses; // posición normalizada 0-1
        // Curva S via función logística
        const s = 1 / (1 + Math.exp(-10 * (x - 0.5)));
        return {
          mes,
          esperado_acum: Math.round(s * presupuesto_total * 100) / 100,
          esperado_mes:  null, // se calcula abajo
        };
      });

      // Calcular valor mensual de la curva S
      curvaS = curvaS.map((p, i) => ({
        ...p,
        esperado_mes: i === 0
          ? p.esperado_acum
          : Math.round((p.esperado_acum - curvaS[i - 1].esperado_acum) * 100) / 100,
      }));
    }

    // Merge curva S + datos reales
    const mesesSet = new Set([
      ...curvaS.map(c => c.mes),
      ...certRes.rows.map(r => r.mes),
    ]);

    const mesesOrdenados = Array.from(mesesSet).sort();

    let acumCert = 0, acumPagado = 0;
    const flujo = mesesOrdenados.map(mes => {
      const real   = certRes.rows.find(r => r.mes === mes);
      const teorico = curvaS.find(c => c.mes === mes);

      acumCert   += real ? Number(real.certificado) : 0;
      acumPagado += real ? Number(real.pagado) : 0;

      return {
        mes,
        mes_label: mes.slice(0, 7), // YYYY-MM
        certificado_mes:   real ? Number(real.certificado) : 0,
        pagado_mes:        real ? Number(real.pagado) : 0,
        certificado_acum:  Math.round(acumCert * 100) / 100,
        pagado_acum:       Math.round(acumPagado * 100) / 100,
        esperado_mes:      teorico ? teorico.esperado_mes : null,
        esperado_acum:     teorico ? teorico.esperado_acum : null,
      };
    });

    res.json({
      presupuesto_total,
      fecha_inicio_obra,
      fecha_fin_obra,
      flujo,
    });

  } catch (error) {
    next(error);
  }
};
