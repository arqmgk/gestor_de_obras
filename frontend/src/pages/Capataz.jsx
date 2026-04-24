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
        <p style={sectionTitle}>Mis tareas</p>

        <select value={obraId} onChange={e => seleccionarObra(e.target.value)}
          style={{ ...iS, width: "100%", marginBottom: "16px" }}>
          <option value="">— Seleccioná una obra —</option>
          {obras.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
        </select>

        {loading && <p style={dimTxt}>Cargando...</p>}
        {!loading && obraId && tasks.length === 0 && <p style={dimTxt}>Esta obra no tiene tareas.</p>}

        {tasks.map(t => (
          <div key={t.id} onClick={() => seleccionarTask(t)}
            style={{ ...card, cursor: "pointer", borderColor: taskSeleccionada?.id === t.id ? "#2563eb" : "#222" }}>
            <strong style={{ color: "#e0e0e0", fontSize: "14px" }}>{t.titulo}</strong>
            <p style={{ color: "#555", margin: "2px 0 6px", fontSize: "12px" }}>
              {t.unidad} · {t.estado}
              {t.responsable && <span> · 👤 {t.responsable}</span>}
            </p>
            <ProgresoBar progreso={t.progreso} />
            <small style={{ color: "#444", fontSize: "11px" }}>
              {Number(t.ejecutado).toFixed(2)} / {Number(t.cantidad_total).toFixed(2)} {t.unidad}
            </small>
          </div>
        ))}
      </div>

      {/* PANEL DERECHO */}
      <div style={{ flex: "2", minWidth: "300px" }}>
        {taskSeleccionada ? (
          <>
            <p style={sectionTitle}>{taskSeleccionada.titulo}</p>
            <p style={{ color: "#555", margin: "0 0 12px", fontSize: "12px" }}>
              Progreso: <strong style={{ color: "#e0e0e0" }}>{pct(taskSeleccionada.progreso)}%</strong>
              {taskSeleccionada.unidad && <span> · {taskSeleccionada.unidad}</span>}
            </p>

            <MedicionForm task={taskSeleccionada} onSuccess={onMedicionGuardada} />

            <p style={{ ...sectionTitle, marginTop: "24px", marginBottom: "10px", fontSize: "12px" }}>Historial</p>
            {mediciones.length === 0 && <p style={dimTxt}>Sin mediciones registradas.</p>}
            {mediciones.length > 0 && (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr>
                    {["Fecha", "Cantidad", "Acumulado", "Observaciones"].map(h => (
                      <th key={h} style={{ textAlign: "left", color: "#444", padding: "4px 8px", borderBottom: "1px solid #1e1e1e", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "11px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mediciones.map(m => (
                    <tr key={m.id} style={{ borderBottom: "1px solid #161616" }}>
                      <td style={td}>{new Date(m.fecha).toLocaleDateString("es-AR")}</td>
                      <td style={td}>{Number(m.cantidad).toFixed(2)}</td>
                      <td style={td}>{Number(m.acumulado).toFixed(2)}</td>
                      <td style={{ ...td, color: "#444" }}>{m.observaciones || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : (
          <p style={{ color: "#2a2a2a", marginTop: "60px", textAlign: "center", fontSize: "13px" }}>
            {obraId ? "Seleccioná una tarea para registrar mediciones." : "Primero seleccioná una obra."}
          </p>
        )}
      </div>
    </div>
  );
}

const sectionTitle = { color: "#e0e0e0", fontSize: "14px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" };
const card = { background: "#111", borderRadius: "6px", padding: "12px", marginBottom: "8px", border: "1px solid #222" };
const iS = { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "4px", color: "#e0e0e0", padding: "8px 10px", fontSize: "13px" };
const dimTxt = { color: "#333", fontSize: "13px" };
const td = { color: "#888", padding: "6px 8px" };
