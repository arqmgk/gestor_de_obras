import pool from '../config/db.js';

// ── OBTENER O CREAR PARTE DEL DÍA ────────────────────────────────────────────

export const getOrCreateParte = async (req, res, next) => {
    try {
        const obraId = Number(req.params.obraId);
        const fecha  = req.query.fecha || new Date().toISOString().slice(0, 10);

        if (isNaN(obraId)) return res.status(400).json({ error: 'obraId inválido' });

        // Verificar que la obra exista
        const obraCheck = await pool.query('SELECT id FROM obras WHERE id = $1', [obraId]);
        if (obraCheck.rows.length === 0) return res.status(404).json({ error: 'Obra no encontrada' });

        // Buscar o crear el parte del día
        let parte = await pool.query(
            'SELECT * FROM parte_diario WHERE obra_id = $1 AND fecha = $2',
            [obraId, fecha]
        );

        if (parte.rows.length === 0) {
            parte = await pool.query(
                `INSERT INTO parte_diario (obra_id, fecha) VALUES ($1, $2) RETURNING *`,
                [obraId, fecha]
            );
        }

        const parteId = parte.rows[0].id;

        // Traer personas del parte
        const personas = await pool.query(
            'SELECT * FROM parte_personas WHERE parte_id = $1 ORDER BY id ASC',
            [parteId]
        );

        res.json({ ...parte.rows[0], personas: personas.rows });

    } catch (error) {
        next(error);
    }
};

// ── HISTORIAL DE PARTES POR OBRA ─────────────────────────────────────────────

export const getPartesByObra = async (req, res, next) => {
    try {
        const obraId = Number(req.params.obraId);
        if (isNaN(obraId)) return res.status(400).json({ error: 'obraId inválido' });

        const result = await pool.query(
            `SELECT
                pd.*,
                COUNT(pp.id)::int AS total_personas,
                json_agg(
                    json_build_object(
                        'id', pp.id,
                        'nombre', pp.nombre,
                        'rol', pp.rol,
                        'empresa', pp.empresa
                    ) ORDER BY pp.id
                ) FILTER (WHERE pp.id IS NOT NULL) AS personas
             FROM parte_diario pd
             LEFT JOIN parte_personas pp ON pp.parte_id = pd.id
             WHERE pd.obra_id = $1
             GROUP BY pd.id
             ORDER BY pd.fecha DESC`,
            [obraId]
        );

        res.json(result.rows);

    } catch (error) {
        next(error);
    }
};

// ── ACTUALIZAR OBSERVACIONES DEL PARTE ───────────────────────────────────────

export const updateParte = async (req, res, next) => {
    try {
        const parteId = Number(req.params.parteId);
        const { observaciones } = req.body;

        if (isNaN(parteId)) return res.status(400).json({ error: 'parteId inválido' });

        const result = await pool.query(
            'UPDATE parte_diario SET observaciones = $1 WHERE id = $2 RETURNING *',
            [observaciones || null, parteId]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'Parte no encontrado' });

        res.json(result.rows[0]);

    } catch (error) {
        next(error);
    }
};

// ── AGREGAR PERSONA AL PARTE ──────────────────────────────────────────────────

export const addPersona = async (req, res, next) => {
    try {
        const parteId = Number(req.params.parteId);
        const { nombre, rol, empresa } = req.body;

        if (isNaN(parteId))  return res.status(400).json({ error: 'parteId inválido' });
        if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
        if (!rol?.trim())    return res.status(400).json({ error: 'El rol es obligatorio' });

        // Verificar que el parte exista
        const parteCheck = await pool.query('SELECT id FROM parte_diario WHERE id = $1', [parteId]);
        if (parteCheck.rows.length === 0) return res.status(404).json({ error: 'Parte no encontrado' });

        const result = await pool.query(
            `INSERT INTO parte_personas (parte_id, nombre, rol, empresa)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [parteId, nombre.trim(), rol.trim(), empresa?.trim() || null]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        next(error);
    }
};

// ── ELIMINAR PERSONA DEL PARTE ────────────────────────────────────────────────

export const deletePersona = async (req, res, next) => {
    try {
        const personaId = Number(req.params.personaId);
        if (isNaN(personaId)) return res.status(400).json({ error: 'personaId inválido' });

        const result = await pool.query(
            'DELETE FROM parte_personas WHERE id = $1 RETURNING *',
            [personaId]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'Persona no encontrada' });

        res.json({ message: 'Persona eliminada', persona: result.rows[0] });

    } catch (error) {
        next(error);
    }
};
