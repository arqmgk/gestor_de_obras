import { useEffect, useState } from "react";
import MedicionForm from "../components/MedicionForm";
import ProgresoBar from "../components/ProgresoBar";
import { getObras, getTasksConProgreso, getProgresoTask, getMediciones } from "../api/api";

export default function Capataz() {
  const [obras, setObras] = useState([]);
  const [obraId, setObraId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [taskSeleccionada, setTaskSeleccionada] = useState(null);
  const [mediciones, setMediciones] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { getObras().then(setObras); }, []);

  const seleccionarObra = async (id) => {
    setObraId(id);
    setTaskSeleccionada(null);
    setMediciones([]);
    if (!id) { setTasks([]); return; }
    setLoading(true);
    setTasks(await getTasksConProgreso(id));
    setLoading(false);
  };

  const seleccionarTask = async (task) => {
    setTaskSeleccionada(task);
    setMediciones(await getMediciones(task.id));
  };

  const onMedicionGuardada = async () => {
    const [prog, med] = await Promise.all([
      getProgresoTask(taskSeleccionada.id),
      getMediciones(taskSeleccionada.id),
    ]);
    setMediciones(med);
    setTasks(prev => prev.map(t => t.id === prog.id ? { ...t, progreso: prog.progreso, ejecutado: prog.ejecutado } : t));
    setTaskSeleccionada(prev => ({ ...prev, progreso: prog.progreso }));
  };

  const pct = (v) => Math.min(Math.max(Number(v) || 0, 0), 100).toFixed(1);

  return (
    <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>

      {/* PANEL IZQUIERDO */}
      <div style={{ flex: "1", minWidth: "260px" }}>
        <h2 style={{ color: "#fff", marginBottom: "12px" }}>Mis tareas</h2>

        <select value={obraId} onChange={e => seleccionarObra(e.target.value)}
          style={{ ...iS, width: "100%", marginBottom: "16px" }}>
          <option value="">— Seleccioná una obra —</option>
          {obras.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
        </select>

        {loading && <p style={{ color: "#666" }}>Cargando...</p>}
        {!loading && obraId && tasks.length === 0 && <p style={{ color: "#666" }}>Esta obra no tiene tareas.</p>}

        {tasks.map(t => (
          <div key={t.id} onClick={() => seleccionarTask(t)}
            style={{ ...cardStyle, cursor: "pointer", border: taskSeleccionada?.id === t.id ? "1px solid #2563eb" : "1px solid #333" }}>
            <strong style={{ color: "#fff" }}>{t.titulo}</strong>
            <p style={{ color: "#888", margin: "2px 0 6px", fontSize: "12px" }}>
              {t.unidad} · {t.estado}
              {t.responsable && <span> · 👤 {t.responsable}</span>}
            </p>
            <ProgresoBar progreso={t.progreso} />
            <small style={{ color: "#666" }}>
              {Number(t.ejecutado).toFixed(2)} / {Number(t.cantidad_total).toFixed(2)} {t.unidad}
            </small>
          </div>
        ))}
      </div>

      {/* PANEL DERECHO */}
      <div style={{ flex: "2", minWidth: "300px" }}>
        {taskSeleccionada ? (
          <>
            <h2 style={{ color: "#fff", margin: "0 0 4px" }}>{taskSeleccionada.titulo}</h2>
            <p style={{ color: "#888", margin: "0 0 12px", fontSize: "13px" }}>
              Progreso: <strong style={{ color: "#fff" }}>{pct(taskSeleccionada.progreso)}%</strong>
              {taskSeleccionada.unidad && <span> · {taskSeleccionada.unidad}</span>}
            </p>

            <MedicionForm task={taskSeleccionada} onSuccess={onMedicionGuardada} />

            <h3 style={{ color: "#ccc", margin: "20px 0 8px" }}>Historial</h3>
            {mediciones.length === 0 && <p style={{ color: "#666" }}>Sin mediciones registradas.</p>}
            {mediciones.length > 0 && (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr>
                    {["Fecha", "Cantidad", "Acumulado", "Observaciones"].map(h => (
                      <th key={h} style={{ textAlign: "left", color: "#888", padding: "4px 8px", borderBottom: "1px solid #333" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mediciones.map(m => (
                    <tr key={m.id} style={{ borderBottom: "1px solid #222" }}>
                      <td style={tdS}>{new Date(m.fecha).toLocaleDateString("es-AR")}</td>
                      <td style={tdS}>{Number(m.cantidad).toFixed(2)}</td>
                      <td style={tdS}>{Number(m.acumulado).toFixed(2)}</td>
                      <td style={{ ...tdS, color: "#888" }}>{m.observaciones || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : (
          <p style={{ color: "#555", marginTop: "40px", textAlign: "center" }}>
            {obraId ? "Seleccioná una tarea para registrar mediciones." : "Primero seleccioná una obra."}
          </p>
        )}
      </div>
    </div>
  );
}

const cardStyle = { background: "#1a1a1a", borderRadius: "8px", padding: "12px", marginBottom: "10px", border: "1px solid #333" };
const iS = { background: "#2c2c2c", border: "1px solid #444", borderRadius: "4px", color: "#fff", padding: "8px 10px" };
const tdS = { color: "#ccc", padding: "6px 8px" };
