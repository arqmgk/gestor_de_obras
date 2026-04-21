import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { obrasApi } from '../../api/index.js';
import { Badge, ProgBar, Metric, Card, Empty, flash } from '../../components/ui.jsx';

const fmt = d => d ? d.slice(0, 10) : '—';

export default function ObrasPage() {
  const navigate = useNavigate();
  const [obras, setObras] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setObras(await obrasApi.getAll(filter)); }
    catch { flash('Error al cargar obras', 'err'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const del = async (id, nombre) => {
    if (!confirm(`¿Eliminar "${nombre}"?\nEsta acción no se puede deshacer.`)) return;
    try { await obrasApi.delete(id); flash('Obra eliminada'); load(); }
    catch (e) { flash(e.message || 'Error al eliminar', 'err'); }
  };

  const total    = obras.length;
  const en_curso = obras.filter(o => o.estado === 'en_curso').length;
  const plan     = obras.filter(o => o.estado === 'planificada').length;
  const term     = obras.filter(o => o.estado === 'terminada').length;

  return (
    <div className="page">
      <div className="ph-row">
        <div className="ph" style={{ marginBottom: 0 }}>
          <h1>Obras</h1>
          <p>Panel de gestión del estudio</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 168 }}>
            <option value="">Todos los estados</option>
            <option value="planificada">Planificada</option>
            <option value="en_curso">En curso</option>
            <option value="terminada">Terminada</option>
          </select>
          <button className="btn btn-primary" onClick={() => navigate('/arquitecto/nueva')}>
            + Nueva obra
          </button>
        </div>
      </div>

      <div className="metrics metrics-4" style={{ marginTop: 20 }}>
        <Metric label="Total"       value={total}    color="arc"   />
        <Metric label="En curso"    value={en_curso} color="arc"   />
        <Metric label="Planificadas"value={plan}     color="amber" />
        <Metric label="Terminadas"  value={term}     color="sage"  />
      </div>

      <Card>
        <div className="tbl-wrap">
          {loading ? (
            <Empty msg="Cargando…" />
          ) : !obras.length ? (
            <Empty msg="No hay obras registradas" />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Dirección</th>
                  <th>Estado</th>
                  <th>Inicio</th>
                  <th>Progreso</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {obras.map(o => (
                  <tr key={o.id}>
                    <td>
                      <strong style={{ fontFamily: 'var(--display)', fontSize: 13 }}>
                        {o.nombre}
                      </strong>
                    </td>
                    <td className="td-dim">{o.direccion || '—'}</td>
                    <td><Badge value={o.estado} /></td>
                    <td className="td-mono">{fmt(o.fecha_inicio)}</td>
                    <td style={{ minWidth: 120 }}>
                      <ProgBar pct={o.progreso} green={o.estado === 'terminada'} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-sm" onClick={() => navigate(`/arquitecto/${o.id}`)}>
                          Ver
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => del(o.id, o.nombre)}>
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
