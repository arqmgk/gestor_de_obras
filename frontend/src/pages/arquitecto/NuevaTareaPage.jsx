import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obrasApi, tasksApi } from '../../api/index.js';
import { Card, BackBtn, flash } from '../../components/ui.jsx';

export default function NuevaTareaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [obraNombre, setObraNombre] = useState('');
  const [form, setForm] = useState({
    titulo: '', responsable: '',
    estado: 'pendiente', unidad: '',
    cantidad_total: '', prioridad: 'media',
    fecha_inicio: '', fecha_fin: '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    obrasApi.getOne(id)
      .then(o => setObraNombre(o.nombre))
      .catch(() => {});
  }, [id]);

  const submit = async () => {
    if (!form.titulo.trim()) { flash('Falta el título', 'err'); return; }
    if (!form.unidad.trim()) { flash('Falta la unidad (m², ml, etc.)', 'err'); return; }
    if (form.fecha_inicio && form.fecha_fin && form.fecha_inicio > form.fecha_fin) {
      flash('La fecha fin no puede ser anterior al inicio', 'err'); return;
    }
    try {
      await tasksApi.create({
        ...form,
        obraId: Number(id),
        cantidad_total: Number(form.cantidad_total) || 0,
        fecha_inicio: form.fecha_inicio || null,
        fecha_fin: form.fecha_fin || null,
      });
      flash('Tarea creada ✓');
      navigate(`/arquitecto/${id}`);
    } catch (e) {
      flash(e.message || 'Error al crear', 'err');
    }
  };

  return (
    <div className="page">
      <BackBtn onClick={() => navigate(`/arquitecto/${id}`)} label="← Volver a la obra" />

      <div className="ph">
        <h1>Nueva tarea</h1>
        {obraNombre && <p style={{ color: 'var(--arc)' }}>{obraNombre}</p>}
      </div>

      <Card style={{ maxWidth: 620 }}>
        <div className="form-grid">
          <div className="field span-2">
            <label>Título *</label>
            <input
              placeholder="Ej: Replanteo estructural planta baja"
              value={form.titulo}
              onChange={e => set('titulo', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Responsable</label>
            <input
              placeholder="Nombre del capataz"
              value={form.responsable}
              onChange={e => set('responsable', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Estado</label>
            <select value={form.estado} onChange={e => set('estado', e.target.value)}>
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En progreso</option>
              <option value="terminado">Terminado</option>
            </select>
          </div>
          <div className="field">
            <label>Unidad *</label>
            <input
              placeholder="m², ml, kg, unid…"
              value={form.unidad}
              onChange={e => set('unidad', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Cantidad total</label>
            <input
              type="number" placeholder="100" min="0"
              value={form.cantidad_total}
              onChange={e => set('cantidad_total', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Prioridad</label>
            <select value={form.prioridad} onChange={e => set('prioridad', e.target.value)}>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
          <div className="field">
            <label>Fecha inicio</label>
            <input type="date" value={form.fecha_inicio} onChange={e => set('fecha_inicio', e.target.value)} />
          </div>
          <div className="field">
            <label>Fecha fin</label>
            <input type="date" value={form.fecha_fin} onChange={e => set('fecha_fin', e.target.value)} />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={submit}>Crear tarea</button>
          <button className="btn btn-ghost" onClick={() => navigate(`/arquitecto/${id}`)}>Cancelar</button>
        </div>
      </Card>
    </div>
  );
}
