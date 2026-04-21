import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obrasApi, tasksApi } from '../../api/index.js';
import { Badge, ProgBar, Metric, Card, Empty, BackBtn, flash } from '../../components/ui.jsx';

const fmt = d => d ? d.slice(0, 10) : '—';

export default function DetalleObraPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [obra, setObra] = useState(null);
  const [prog, setProg] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [obraData, progData] = await Promise.all([
        obrasApi.getOne(id),
        obrasApi.getProgreso(id),
      ]);
      setObra(obraData);
      setProg(progData.progreso || 0);
    } catch { flash('Error al cargar obra', 'err'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const delTarea = async (taskId) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    try { await tasksApi.delete(taskId); flash('Tarea eliminada'); load(); }
    catch (e) { flash(e.message || 'Error', 'err'); }
  };

  if (loading) return <div className="page"><Empty msg="Cargando…" /></div>;
  if (!obra)   return <div className="page"><Empty msg="No se pudo cargar la obra" /></div>;

  const tasks = obra.tasks || [];

  return (
    <div className="page">
      <BackBtn onClick={() => navigate('/arquitecto')} label="← Volver a obras" />

      <div className="ph-row">
        <div>
          <h1>{obra.nombre}</h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6 }}>
            <span style={{ color: 'var(--mist)', fontSize: 12 }}>{obra.direccion || 'Sin dirección'}</span>
            <Badge value={obra.estado} />
            <span className="td-mono">{fmt(obra.fecha_inicio)} → {fmt(obra.fecha_fin)}</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate(`/arquitecto/${id}/nueva-tarea`)}>
          + Nueva tarea
        </button>
      </div>

      <div className="metrics metrics-3">
        <Metric label="Total tareas" value={tasks.length}                                          color="arc"   />
        <Metric label="En progreso"  value={tasks.filter(t => t.estado === 'en_progreso').length}  color="arc"   />
        <Metric label="Terminadas"   value={tasks.filter(t => t.estado === 'terminado').length}    color="sage"  />
      </div>

      <Card title="Avance real por mediciones">
        <ProgBar pct={prog} size="lg" />
      </Card>

      <Card title="Tareas">
        {!tasks.length ? (
          <Empty msg="Sin tareas. Usá el botón de arriba para agregar la primera." />
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tarea</th>
                  <th>Responsable</th>
                  <th>Unidad</th>
                  <th>Estado</th>
                  <th>Prioridad</th>
                  <th>Fin</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id}>
                    <td>
                      <strong style={{ fontFamily: 'var(--display)', fontSize: 13 }}>
                        {t.titulo}
                      </strong>
                    </td>
                    <td className="td-dim">{t.responsable || '—'}</td>
                    <td className="td-mono">{t.unidad || '—'}</td>
                    <td><Badge value={t.estado} /></td>
                    <td><Badge value={t.prioridad} /></td>
                    <td className="td-mono">{fmt(t.fecha_fin)}</td>
                    <td>
                      <button className="btn btn-xs btn-danger" onClick={() => delTarea(t.id)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
