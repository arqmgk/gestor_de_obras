import { useState, useEffect } from 'react';
import { obrasApi, tasksApi } from '../../api/index.js';
import { Card, Empty, flash } from '../../components/ui.jsx';

const fmt = d => d ? d.slice(0, 10) : '—';

export default function CapMedicion() {
  const [obras,    setObras]    = useState([]);
  const [obraId,   setObraId]   = useState('');
  const [tasks,    setTasks]    = useState([]);
  const [taskId,   setTaskId]   = useState('');
  const [taskInfo, setTaskInfo] = useState(null);
  const [historial,setHistorial]= useState([]);
  const [cantidad, setCantidad] = useState('');
  const [obs,      setObs]      = useState('');
  const [sending,  setSending]  = useState(false);

  // Load obras on mount
  useEffect(() => {
    obrasApi.getAll()
      .then(setObras)
      .catch(() => flash('Error al cargar obras', 'err'));
  }, []);

  // Load tasks when obra changes
  const handleObraChange = async (oid) => {
    setObraId(oid);
    setTaskId(''); setTaskInfo(null); setHistorial([]); setTasks([]);
    if (!oid) return;
    try { setTasks(await obrasApi.getTasks(oid)); }
    catch { flash('Error al cargar tareas', 'err'); }
  };

  // Load task detail + historial when task changes
  const handleTaskChange = async (tid) => {
    setTaskId(tid); setTaskInfo(null); setHistorial([]);
    if (!tid) return;
    try {
      const [info, meds] = await Promise.all([
        tasksApi.getProgreso(tid),
        tasksApi.getMediciones(tid),
      ]);
      setTaskInfo(info);
      setHistorial(meds);
    } catch { flash('Error al cargar tarea', 'err'); }
  };

  const refresh = async () => {
    if (!taskId) return;
    const [info, meds] = await Promise.all([
      tasksApi.getProgreso(taskId),
      tasksApi.getMediciones(taskId),
    ]);
    setTaskInfo(info);
    setHistorial(meds);
  };

  const enviar = async () => {
    if (!taskId)              { flash('Seleccioná una tarea', 'err'); return; }
    if (cantidad === '')      { flash('Ingresá una cantidad', 'err'); return; }
    if (Number(cantidad) < 0) { flash('La cantidad no puede ser negativa', 'err'); return; }
    setSending(true);
    try {
      await tasksApi.addMedicion(taskId, {
        cantidad: Number(cantidad),
        observaciones: obs || null,
      });
      flash('Medición registrada ✓');
      setCantidad(''); setObs('');
      await refresh();
    } catch (e) {
      flash(e.message || 'Error al registrar', 'err');
    } finally {
      setSending(false);
    }
  };

  const unidad = taskInfo?.unidad
    || tasks.find(t => String(t.id) === String(taskId))?.unidad
    || '';

  return (
    <div className="page">
      <div className="ph">
        <h1>Cargar medición</h1>
        <p>Registrar avance de una tarea desde la obra</p>
      </div>

      <div className="med-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start' }}>

        {/* ── Left column ── */}
        <div>
          <Card title="Selección">
            <div className="field" style={{ marginBottom: 12 }}>
              <label>Obra</label>
              <select value={obraId} onChange={e => handleObraChange(e.target.value)}>
                <option value="">— elegir obra —</option>
                {obras.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Tarea</label>
              <select
                value={taskId}
                onChange={e => handleTaskChange(e.target.value)}
                disabled={!tasks.length}
              >
                <option value="">— elegir tarea —</option>
                {tasks.map(t => <option key={t.id} value={t.id}>{t.titulo}</option>)}
              </select>
            </div>
          </Card>

          {taskInfo && (
            <Card title="Nueva medición">
              {/* Info strip */}
              <div className="info-strip">
                <div className="info-item">
                  <label>Unidad</label>
                  <strong>{unidad || '—'}</strong>
                </div>
                <div className="info-item">
                  <label>Ejecutado</label>
                  <strong>{taskInfo.ejecutado || 0} {unidad}</strong>
                </div>
                <div className="info-item">
                  <label>Total</label>
                  <strong>{taskInfo.cantidad_total || '—'} {unidad}</strong>
                </div>
                <div className="info-item">
                  <label>Avance</label>
                  <strong style={{ color: 'var(--sage)' }}>
                    {(taskInfo.progreso || 0).toFixed(1)}%
                  </strong>
                </div>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label>Cantidad *</label>
                  <input
                    type="number" placeholder="0" min="0" step="0.01"
                    value={cantidad}
                    onChange={e => setCantidad(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Observaciones</label>
                  <input
                    placeholder="Opcional"
                    value={obs}
                    onChange={e => setObs(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button
                  className="btn btn-sage"
                  onClick={enviar}
                  disabled={sending}
                >
                  {sending ? 'Registrando…' : 'Registrar avance'}
                </button>
              </div>
            </Card>
          )}
        </div>

        {/* ── Right column: historial ── */}
        <Card title="Historial de mediciones" style={{ minHeight: 200 }}>
          {!taskId ? (
            <Empty msg="Seleccioná una tarea" />
          ) : !historial.length ? (
            <Empty msg="Sin mediciones registradas aún" />
          ) : (
            historial.map(m => (
              <div className="med-row" key={m.id}>
                <span className="med-date">{fmt(m.fecha)}</span>
                <span className="med-qty">+{m.cantidad} {unidad}</span>
                <span className="med-obs">{m.observaciones || ''}</span>
              </div>
            ))
          )}
        </Card>

      </div>
    </div>
  );
}
