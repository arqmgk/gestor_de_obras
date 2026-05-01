import pool from '../config/db.js';

// Listar todos los índices agrupados por fuente
export const getIndices = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT * FROM indices ORDER BY fuente ASC, mes DESC`
        );
        res.json(result.rows);
    } catch (error) { next(error); }
};

// Último índice por fuente
export const getUltimosIndices = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT DISTINCT ON (fuente) *
             FROM indices
             ORDER BY fuente, mes DESC`
        );
        res.json(result.rows);
    } catch (error) { next(error); }
};

// Agregar índice
export const addIndice = async (req, res, next) => {
    try {
        const { fuente, mes, valor, notas } = req.body;

        if (!fuente?.trim()) return res.status(400).json({ error: 'Fuente obligatoria' });
        if (!mes)            return res.status(400).json({ error: 'Mes obligatorio' });
        const valorNum = Number(valor);
        if (!valorNum || valorNum <= 0) return res.status(400).json({ error: 'Valor inválido' });

        // Normalizar mes al primer día
        const mesNorm = new Date(mes);
        mesNorm.setDate(1);

        const result = await pool.query(
            `INSERT INTO indices (fuente, mes, valor, notas)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (fuente, mes) DO UPDATE SET valor = $3, notas = $4
             RETURNING *`,
            [fuente.trim(), mesNorm.toISOString().slice(0,10), valorNum, notas?.trim() || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) { next(error); }
};

// Eliminar índice
export const deleteIndice = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'id inválido' });
        await pool.query('DELETE FROM indices WHERE id = $1', [id]);
        res.json({ message: 'Índice eliminado' });
    } catch (error) { next(error); }
};

// Aplicar coeficiente a tareas seleccionadas
export const aplicarCoeficiente = async (req, res, next) => {
    try {
        const { task_ids, coeficiente, fuente, mes } = req.body;

        if (!Array.isArray(task_ids) || task_ids.length === 0)
            return res.status(400).json({ error: 'task_ids requerido' });
        const coef = Number(coeficiente);
        if (!coef || coef <= 0)
            return res.status(400).json({ error: 'Coeficiente inválido' });

        // Actualizar precio_unitario multiplicando por el coeficiente
        // Solo tareas que tengan precio_unitario cargado
        const result = await pool.query(
            `UPDATE tasks
             SET precio_unitario = ROUND(precio_unitario * $1, 2)
             WHERE id = ANY($2::int[]) AND precio_unitario IS NOT NULL
             RETURNING id, titulo, precio_unitario`,
            [coef, task_ids]
        );

        res.json({
            actualizadas: result.rows.length,
            tareas: result.rows,
            coeficiente: coef,
            fuente,
            mes,
        });
    } catch (error) { next(error); }
};
