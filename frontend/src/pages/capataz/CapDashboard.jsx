import { useState, useEffect } from 'react';
import { obrasApi } from '../../api/index.js';
import { Badge, ProgBar, Metric, Card, Empty, flash } from '../../components/ui.jsx';

const fmt = d => d ? d.slice(0, 10) : '—';

export default function CapDashboard() {
  const [obras, setObras]   = useState([]);
  const [obraId, setObraId] = useState('');
  const [obra, setObra]     = useState(null);
  const [prog, setProg]     = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    obrasApi.getAll().then(setObras).catch(() => flash('Error al cargar obras', 'err'));
  }, []);

  useEffect(() => {
    if (!obraId) { setObra(null); return; }
    setLoading(true);
    Promise.all([
      obrasApi.getOne(obraId),
      obrasApi.getProgreso(obraId),
    ])
      .then(([o, p]) => { setObra(o); setProg(p.progreso || 0); })
      .catch(() => flash('Error al cargar obra', 'err'))
      .finally(() => setLoading(false));
  }, [obraId]);

  const tasks = obra?.tasks || [];

  return (
    <div className="page">
      <div className="ph">
        <h1>Mi obra del día</h1>
        <p>Vista de campo — avance y tareas asignadas</p>
      </div>

      <Card style={{ maxWidth: 380 }}>
        <div className="field">
          <label>Seleccionar obra</label>
          <select value={obraId} onChange={e => setObraId(e.target.value)}>
            <option value="">— elegir obra —</option>
            {obras.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
          </select>
        </div>
      </Card>

      {loading && <Empty msg="Cargando…" />}

      {obra && !loading && (
        <>
          <div className="metrics metrics-3">
            <Metric label="Avance real"  value={`${prog.toFixed(1)}%`} color="sage"  />
            <Metric label="En progreso"  value={tasks.filter(t => t.estado === 'en_progreso').length} color="arc" />
            <Metric label="Pendientes"   value={tasks.filter(t => t.estado === 'pendiente').length}   color="amber" />
          </div>

          <Card title="Avance por mediciones">
            <ProgBar pct={prog} size="lg" />
          </Card>

          <Card title="Tareas asignadas">
            {!tasks.length ? (
              <Empty msg="Sin tareas asignadas en esta obra" />
            ) : (
              tasks.map(t => (
                <div className="task-card" key={t.id}>
                  <div className="task-card-body">
                    <div className="task-card-title">{t.titulo}</div>
                    <div className="task-card-meta">
                      <Badge value={t.estado} />
                      <Badge value={t.prioridad} />
                      {t.responsable && (
                        <span className="td-mono" style={{ fontSize: 10 }}>{t.responsable}</span>
                      )}
                      <span className="td-mono" style={{ fontSize: 10, color: 'var(--dust)' }}>
                        Fin: {fmt(t.fecha_fin)}
                      </span>
                    </div>
                  </div>
                  <div className="task-prog-col">
                    <div className="prog-track">
                      <div className="prog-fill" style={{ width: 0 }} />
                    </div>
                    <div className="prog-pct">{t.unidad || ''}</div>
                  </div>
                </div>
              ))
            )}
          </Card>
        </>
      )}
    </div>
  );
}
