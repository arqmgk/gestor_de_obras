import { useEffect, useState } from "react";
import MedicionForm from "../components/MedicionForm";
import ProgresoBar from "../components/ProgresoBar";
import { getObras, getTasksConProgreso, getProgresoTask, getMediciones } from "../api/api";

export default function Capataz() {
  const [obras, setObras] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [obraId, setObraId] = useState("");
  const [obraNombre, setObraNombre] = useState("");
  const [tasks, setTasks] = useState([]);
  const [taskAbierta, setTaskAbierta] = useState(null);
  const [mediciones, setMediciones] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { getObras().then(setObras); }, []);

  const obrasFiltradas = obras.filter(o =>
    o.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (o.direccion || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const seleccionarObra = async (id, nombre) => {
    setObraId(id); setObraNombre(nombre);
    setTaskAbierta(null); setMediciones({});
    setBusqueda("");
    if (!id) { setTasks([]); return; }
    setLoading(true);
    setTasks(await getTasksConProgreso(id));
    setLoading(false);
  };

  const toggleTask = async (task) => {
    if (taskAbierta === task.id) { setTaskAbierta(null); return; }
    setTaskAbierta(task.id);
    if (!mediciones[task.id]) {
      const med = await getMediciones(task.id);
      setMediciones(prev => ({ ...prev, [task.id]: med }));
    }
  };

  const onMedicionGuardada = async (task) => {
    const [prog, med] = await Promise.all([getProgresoTask(task.id), getMediciones(task.id)]);
    setMediciones(prev => ({ ...prev, [task.id]: med }));
    setTasks(prev => prev.map(t =>
      t.id === task.id ? { ...t, progreso: prog.progreso, ejecutado: prog.ejecutado } : t
    ));
  };

  const pct = (v) => Math.min(Math.max(parseFloat(v) || 0, 0), 100).toFixed(1);
  const barColor = (v) => parseFloat(v) < 30 ? "#e74c3c" : parseFloat(v) < 70 ? "#f39c12" : "#27ae60";

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto" }}>

      {/* SI NO HAY OBRA SELECCIONADA: mostrar buscador + lista */}
      {!obraId ? (
        <>
          <p style={secTitle}>Seleccioná una obra</p>

          {/* BUSCADOR */}
          <div style={{ position: "relative", marginBottom: "14px" }}>
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#444", fontSize: "13px", pointerEvents: "none" }}>🔍</span>
            <input
              type="text"
              placeholder="Buscar obra..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ ...iS, width: "100%", boxSizing: "border-box", paddingLeft: "32px" }}
            />
            {busqueda && (
              <button onClick={() => setBusqueda("")}
                style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "14px", padding: "2px 6px" }}>
                ✕
              </button>
            )}
          </div>

          {obras.length === 0 && <p style={dimTxt}>Sin obras disponibles.</p>}
          {busqueda && obrasFiltradas.length === 0 && <p style={dimTxt}>Sin resultados para "{busqueda}".</p>}

          {obrasFiltradas.map(o => (
            <div key={o.id} onClick={() => seleccionarObra(String(o.id), o.nombre)}
              style={{ ...card, cursor: "pointer", marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ color: "#e0e0e0", fontSize: "14px" }}>{o.nombre}</strong>
                  {o.direccion && <p style={{ color: "#444", margin: "2px 0 0", fontSize: "12px" }}>{o.direccion}</p>}
                </div>
                <span style={{ color: "#2563eb", fontSize: "18px" }}>›</span>
              </div>
            </div>
          ))}
        </>
      ) : (
        <>
          {/* CABECERA CON VOLVER */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <button onClick={() => seleccionarObra("", "")}
              style={{ background: "none", border: "1px solid #2a2a2a", borderRadius: "4px", color: "#888", cursor: "pointer", padding: "5px 10px", fontSize: "13px" }}>
              ← Volver
            </button>
            <span style={secTitle}>{obraNombre}</span>
          </div>

          {loading && <p style={dimTxt}>Cargando tareas...</p>}
          {!loading && tasks.length === 0 && <p style={dimTxt}>Esta obra no tiene tareas.</p>}

          {/* LISTA TAREAS */}
          {tasks.map(t => {
            const abierta = taskAbierta === t.id;
            const meds = mediciones[t.id] || [];

            return (
              <div key={t.id} style={{ marginBottom: "8px" }}>

                {/* CABECERA TAREA */}
                <div onClick={() => toggleTask(t)}
                  style={{ ...card, cursor: "pointer", borderColor: abierta ? "#2563eb" : "#222", marginBottom: 0, borderRadius: abierta ? "6px 6px 0 0" : "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ color: abierta ? "#60a5fa" : "#e0e0e0", fontWeight: "600", fontSize: "14px" }}>
                      {abierta ? "▾" : "▸"} {t.titulo}
                    </span>
                    <span style={{ color: barColor(t.progreso), fontSize: "12px", fontWeight: "600" }}>
                      {pct(t.progreso)}%
                    </span>
                    {t.estado && <span style={{ ...badge, background: "#1a1a1a", color: "#444" }}>{t.estado}</span>}
                  </div>
                  {t.responsable && <p style={{ color: "#444", margin: "4px 0 4px", fontSize: "12px" }}>👤 {t.responsable}</p>}
                  <p style={{ color: "#333", margin: "2px 0 6px", fontSize: "12px" }}>
                    {Number(t.ejecutado).toFixed(2)} / {Number(t.cantidad_total).toFixed(2)} {t.unidad}
                  </p>
                  <div style={{ background: "#1a1a1a", borderRadius: "3px", height: "4px", overflow: "hidden" }}>
                    <div style={{ background: barColor(t.progreso), height: "100%", width: `${pct(t.progreso)}%`, transition: "width 0.4s" }} />
                  </div>
                </div>

                {/* PANEL EXPANDIDO */}
                {abierta && (
                  <div style={{ border: "1px solid #1e1e1e", borderTop: "none", borderRadius: "0 0 6px 6px", background: "#0d0d0d", padding: "16px" }}>

                    <MedicionForm task={t} onSuccess={() => onMedicionGuardada(t)} />

                    <p style={{ color: "#333", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", margin: "20px 0 10px" }}>
                      Historial ({meds.length})
                    </p>

                    {meds.length === 0 && <p style={dimTxt}>Sin mediciones registradas.</p>}

                    {meds.length > 0 && (
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                        <thead>
                          <tr>
                            {["Fecha", "Cantidad", "Acumulado", "Observaciones"].map(h => (
                              <th key={h} style={{ textAlign: "left", color: "#333", padding: "4px 8px", borderBottom: "1px solid #1a1a1a", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "10px" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {meds.map(m => (
                            <tr key={m.id} style={{ borderBottom: "1px solid #141414" }}>
                              <td style={td}>{new Date(m.fecha).toLocaleDateString("es-AR")}</td>
                              <td style={td}>{Number(m.cantidad).toFixed(2)}</td>
                              <td style={td}>{Number(m.acumulado).toFixed(2)}</td>
                              <td style={{ ...td, color: "#333" }}>{m.observaciones || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

const secTitle = { color: "#e0e0e0", fontSize: "14px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" };
const card = { background: "#111", borderRadius: "6px", padding: "12px", border: "1px solid #222" };
const iS = { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "4px", color: "#e0e0e0", padding: "7px 10px", fontSize: "13px" };
const badge = { display: "inline-block", borderRadius: "3px", padding: "2px 7px", fontSize: "11px" };
const dimTxt = { color: "#333", fontSize: "13px", margin: "8px 0" };
const td = { color: "#666", padding: "6px 8px" };
