import pool from '../config/db.js';

export const getContactos = async (req, res, next) => {
    try {
        const obraId = Number(req.params.obraId);
        if (isNaN(obraId)) return res.status(400).json({ error: 'obraId inválido' });

        const result = await pool.query(
            `SELECT * FROM contactos
             WHERE obra_id = $1
             ORDER BY es_emergencia DESC, orden ASC, id ASC`,
            [obraId]
        );

        res.json(result.rows);
    } catch (error) { next(error); }
};

export const addContacto = async (req, res, next) => {
    try {
        const obraId = Number(req.params.obraId);
        const { nombre, rol, telefono, direccion, observaciones, es_emergencia } = req.body;

        if (isNaN(obraId))   return res.status(400).json({ error: 'obraId inválido' });
        if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
        if (!rol?.trim())    return res.status(400).json({ error: 'El rol es obligatorio' });

        const obraCheck = await pool.query('SELECT id FROM obras WHERE id = $1', [obraId]);
        if (obraCheck.rows.length === 0) return res.status(404).json({ error: 'Obra no encontrada' });

        const result = await pool.query(
            `INSERT INTO contactos (obra_id, nombre, rol, telefono, direccion, observaciones, es_emergencia)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
            [obraId, nombre.trim(), rol.trim(),
             telefono?.trim() || null, direccion?.trim() || null,
             observaciones?.trim() || null, es_emergencia === true || es_emergencia === 'true']
        );

        res.status(201).json(result.rows[0]);
    } catch (error) { next(error); }
};

export const updateContacto = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const { nombre, rol, telefono, direccion, observaciones, es_emergencia } = req.body;

        if (isNaN(id)) return res.status(400).json({ error: 'id inválido' });

        const result = await pool.query(
            `UPDATE contactos
             SET nombre=$1, rol=$2, telefono=$3, direccion=$4, observaciones=$5, es_emergencia=$6
             WHERE id=$7 RETURNING *`,
            [nombre?.trim(), rol?.trim(),
             telefono?.trim() || null, direccion?.trim() || null,
             observaciones?.trim() || null,
             es_emergencia === true || es_emergencia === 'true', id]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'Contacto no encontrado' });
        res.json(result.rows[0]);
    } catch (error) { next(error); }
};

export const deleteContacto = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'id inválido' });

        const result = await pool.query('DELETE FROM contactos WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Contacto no encontrado' });
        res.json({ message: 'Contacto eliminado' });
    } catch (error) { next(error); }
};
