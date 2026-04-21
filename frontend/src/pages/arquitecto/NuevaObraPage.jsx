import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obrasApi } from '../../api/index.js';
import { Card, BackBtn, flash } from '../../components/ui.jsx';

export default function NuevaObraPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '', direccion: '',
    estado: 'planificada',
    fecha_inicio: '', fecha_fin: '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.nombre.trim()) { flash('Falta el nombre', 'err'); return; }
    if (form.fecha_inicio && form.fecha_fin && form.fecha_inicio > form.fecha_fin) {
      flash('La fecha fin no puede ser anterior al inicio', 'err'); return;
    }
    try {
      await obrasApi.create({
        ...form,
        fecha_inicio: form.fecha_inicio || null,
        fecha_fin: form.fecha_fin || null,
      });
      flash('Obra creada ✓');
      navigate('/arquitecto');
    } catch (e) {
      flash(e.message || 'Error al crear', 'err');
    }
  };

  return (
    <div className="page">
      <BackBtn onClick={() => navigate('/arquitecto')} label="← Volver a obras" />

      <div className="ph">
        <h1>Nueva obra</h1>
        <p>Registrar un proyecto nuevo en el sistema</p>
      </div>

      <Card style={{ maxWidth: 620 }}>
        <div className="form-grid">
          <div className="field span-2">
            <label>Nombre *</label>
            <input
              placeholder="Ej: Vivienda Unifamiliar Lugano"
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
            />
          </div>
          <div className="field span-2">
            <label>Dirección</label>
            <input
              placeholder="Ej: Av. Corrientes 1234, CABA"
              value={form.direccion}
              onChange={e => set('direccion', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Estado</label>
            <select value={form.estado} onChange={e => set('estado', e.target.value)}>
              <option value="planificada">Planificada</option>
              <option value="en_curso">En curso</option>
              <option value="terminada">Terminada</option>
            </select>
          </div>
          <div className="field">
            <label>Fecha inicio</label>
            <input type="date" value={form.fecha_inicio} onChange={e => set('fecha_inicio', e.target.value)} />
          </div>
          <div className="field">
            <label>Fecha fin prevista</label>
            <input type="date" value={form.fecha_fin} onChange={e => set('fecha_fin', e.target.value)} />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={submit}>Crear obra</button>
          <button className="btn btn-ghost" onClick={() => navigate('/arquitecto')}>Cancelar</button>
        </div>
      </Card>
    </div>
  );
}
