import { useEffect, useState } from "react";
import TaskForm from "../components/TaskForm";
import ProgresoBar from "../components/ProgresoBar";
import { getObras, createObra, updateObra, deleteObra, getTasksConProgreso, getProgresoObra, deleteTask } from "../api/api";

const OBRA_EMPTY = { nombre: "", direccion: "", estado: "en_curso", fecha_inicio: "", fecha_fin: "" };
const estadoLabel = { en_curso: "En curso", pausada: "Pausada", finalizada: "Finalizada" };
const estadoColors = {
  en_curso:   { bg: "#0d2a0d", color: "#4ade80" },
  finalizada: { bg: "#0d1a2a", color: "#60a5fa" },
  pausada:    { bg: "#2a1a0d", color: "#fbbf24" },
};
const prioColor = { alta: "#e74c3c", media: "#f39c12", baja: "#27ae60" };

export default function Arquitecto() {
  const [obras, setObras] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [obraAbierta, setObraAbierta] = useState(null);
  const [tasks, setTasks] = useState({});
  const [progreso, setProgreso] = useState({});

  const [obraForm, setObraForm] = useState(OBRA_EMPTY);
  const [editandoObra, setEditandoObra] = useState(null);
  const [mostrarObraForm, setMostrarObraForm] = useState(false);
  const [obraError, setObraError] = useState(null);

  const [mostrarTaskForm, setMostrarTaskForm] = useState(false);
  const [editandoTask, setEditandoTask] = useState(null);

  useEffect(() => { cargarObras(); }, []);

  const cargarObras = async () => setObras(await getObras());

  const obrasFiltradas = obras.filter(o =>
    o.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (o.direccion || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const toggleObra = async (obra) => {
    if (obraAbierta === obra.id) { setObraAbierta(null); return; }
    setObraAbierta(obra.id);
    setMostrarTaskForm(false); setEditandoTask(null);
    if (!tasks[obra.id]) {
      const [t, p] = await Promise.all([getTasksConProgreso(obra.id), getProgresoObra(obra.id)]);
      setTasks(prev => ({ ...prev, [obra.id]: t }));
      setProgreso(prev => ({ ...prev, [obra.id]: p }));
    }
  };

  const recargarTasks = async (obraId) => {
    const [t, p] = await Promise.all([getTasksConProgreso(obraId), getProgresoObra(obraId)]);
    setTasks(prev => ({ ...prev, [obraId]: t }));
    setProgreso(prev => ({ ...prev, [obraId]: p }));
  };

  const abrirNuevaObra = () => {
    setObraForm(OBRA_EMPTY); setEditandoObra(null); setObraError(null); setMostrarObraForm(true);
  };

  const abrirEditarObra = (e, obra) => {
    e.stopPropagation();
    setObraForm({
      nombre: obra.nombre || "", direccion: obra.direccion || "",
      estado: obra.estado || "en_curso",
      fecha_inicio: obra.fecha_inicio ? obra.fecha_inicio.slice(0, 10) : "",
      fecha_fin: obra.fecha_fin ? obra.fecha_fin.slice(0, 10) : "",
    });
    setEditandoObra(obra.id); setObraError(null); setMostrarObraForm(true);
  };

  const guardarObra = async () => {
    setObraError(null);
    if (!obraForm.nombre) { setObraError("El nombre es obligatorio"); return; }
    const payload = { ...obraForm, fecha_inicio: obraForm.fecha_inicio || null, fecha_fin: obraForm.fecha_fin || null };
    const res = editandoObra ? await updateObra(editandoObra, payload) : await createObra(payload);
    if (res.error) { setObraError(res.error); return; }
    setMostrarObraForm(false); setEditandoObra(null);
    await cargarObras();
    if (editandoObra) recargarTasks(editandoObra);
  };

  const eliminarObra = async (e, id) => {
    e.stopPropagation();
    if (!confirm("¿Eliminar obra y todas sus tareas?")) return;
    await deleteObra(id);
    if (obraAbierta === id) setObraAbierta(null);
    cargarObras();
  };

  const onTaskGuardada = async () => {
    setMostrarTaskForm(false); setEditandoTask(null);
    if (obraAbierta) recargarTasks(obraAbierta);
  };

  const eliminarTask = async (tid) => {
    if (!confirm("¿Eliminar esta tarea?")) return;
    await deleteTask(tid);
    if (obraAbierta) recargarTasks(obraAbierta);
  };

  const pct = (v) => Math.min(Math.max(parseFloat(v) || 0, 0), 100).toFixed(1);
  const barColor = (v) => parseFloat(v) < 30 ? "#e74c3c" : parseFloat(v) < 70 ? "#f39c12" : "#27ae60";

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <span style={secTitle}>Obras ({obrasFiltradas.length})</span>
        <button onClick={abrirNuevaObra} style={btnP}>+ Nueva obra</button>
      </div>

      {/* BUSCADOR */}
      <div style={{ position: "relative", marginBottom: "16px" }}>
        <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#444", fontSize: "13px", pointerEvents: "none" }}>🔍</span>
        <input
          type="text"
          placeholder="Buscar por nombre o dirección..."
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

      {/* FORM OBRA */}
      {mostrarObraForm && (
        <div style={{ ...card, marginBottom: "12px" }}>
          <p style={formTitle}>{editandoObra ? "Editar obra" : "Nueva obra"}</p>
          {[["nombre", "Nombre *"], ["direccion", "Dirección"]].map(([k, ph]) => (
            <input key={k} placeholder={ph} value={obraForm[k]}
              onChange={e => setObraForm({ ...obraForm, [k]: e.target.value })}
              style={{ ...iS, width: "100%", marginBottom: "8px", boxSizing: "border-box" }} />
          ))}
          <div style={grid2}>
            <div>
              <label style={lbl}>Inicio</label>
              <input type="date" value={obraForm.fecha_inicio}
                onChange={e => setObraForm({ ...obraForm, fecha_inicio: e.target.value })}
                style={{ ...iS, width: "100%", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={lbl}>Fin</label>
              <input type="date" value={obraForm.fecha_fin}
                onChange={e => setObraForm({ ...obraForm, fecha_fin: e.target.value })}
                style={{ ...iS, width: "100%", boxSizing: "border-box" }} />
            </div>
          </div>
          <select value={obraForm.estado} onChange={e => setObraForm({ ...obraForm, estado: e.target.value })}
            style={{ ...iS, width: "100%", margin: "8px 0 12px" }}>
            <option value="en_curso">En curso</option>
            <option value="pausada">Pausada</option>
            <option value="finalizada">Finalizada</option>
          </select>
          {obraError && <p style={errTxt}>{obraError}</p>}
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={guardarObra} style={btnP}>{editandoObra ? "Guardar" : "Crear"}</button>
            <button onClick={() => setMostrarObraForm(false)} style={btnS}>Cancelar</button>
          </div>
        </div>
      )}

      {obras.length === 0 && !mostrarObraForm && <p style={dimTxt}>Sin obras todavía.</p>}
      {busqueda && obrasFiltradas.length === 0 && <p style={dimTxt}>Sin resultados para "{busqueda}".</p>}

      {/* LISTA OBRAS */}
      {obrasFiltradas.map(o => {
        const abierta = obraAbierta === o.id;
        const ec = estadoColors[o.estado] || estadoColors.en_curso;
        const p = progreso[o.id];
        const obraTasks = tasks[o.id] || [];

        return (
          <div key={o.id} style={{ marginBottom: "8px" }}>

            {/* CABECERA */}
            <div onClick={() => toggleObra(o)}
              style={{ ...card, cursor: "pointer", borderColor: abierta ? "#2563eb" : "#222", marginBottom: 0, borderRadius: abierta ? "6px 6px 0 0" : "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span style={{ color: abierta ? "#60a5fa" : "#e0e0e0", fontWeight: "600", fontSize: "14px" }}>
                      {abierta ? "▾" : "▸"} {o.nombre}
                    </span>
                    <span style={{ ...badge, background: ec.bg, color: ec.color }}>
                      {estadoLabel[o.estado] || o.estado}
                    </span>
                    {p && <span style={{ color: barColor(p.progreso), fontSize: "12px", fontWeight: "600" }}>{pct(p.progreso)}%</span>}
                  </div>
                  {o.direccion && <p style={{ color: "#444", margin: "2px 0 0", fontSize: "12px" }}>{o.direccion}</p>}
                </div>
                <div style={{ display: "flex", gap: "2px", marginLeft: "8px" }}>
                  <button onClick={e => abrirEditarObra(e, o)} style={btnIcon}>✏️</button>
                  <button onClick={e => eliminarObra(e, o.id)} style={{ ...btnIcon, color: "#e74c3c" }}>✕</button>
                </div>
              </div>
              {p && (
                <div style={{ marginTop: "8px" }}>
                  <div style={{ background: "#1a1a1a", borderRadius: "3px", height: "4px", overflow: "hidden" }}>
                    <div style={{ background: barColor(p.progreso), height: "100%", width: `${pct(p.progreso)}%`, transition: "width 0.4s" }} />
                  </div>
                </div>
              )}
            </div>

            {/* PANEL EXPANDIDO */}
            {abierta && (
              <div style={{ border: "1px solid #1e1e1e", borderTop: "none", borderRadius: "0 0 6px 6px", background: "#0d0d0d", padding: "16px" }}>
                {p && (
                  <div style={{ marginBottom: "16px", padding: "10px 12px", background: "#111", borderRadius: "4px", border: "1px solid #1e1e1e" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ color: "#555", fontSize: "12px" }}>Progreso general</span>
                      <span style={{ color: barColor(p.progreso), fontSize: "13px", fontWeight: "700" }}>{pct(p.progreso)}%</span>
                    </div>
                    <div style={{ background: "#1a1a1a", borderRadius: "3px", height: "8px", overflow: "hidden" }}>
                      <div style={{ background: barColor(p.progreso), height: "100%", width: `${pct(p.progreso)}%`, transition: "width 0.4s" }} />
                    </div>
                    <p style={{ color: "#333", margin: "5px 0 0", fontSize: "11px" }}>
                      {Number(p.ejecutado).toFixed(2)} ejecutado · {Number(p.total).toFixed(2)} total
                    </p>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ color: "#444", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Tareas ({obraTasks.length})
                  </span>
                  <button onClick={() => { setMostrarTaskForm(true); setEditandoTask(null); }} style={btnP}>+ Tarea</button>
                </div>

                {mostrarTaskForm && (
                  <TaskForm
                    obraId={o.id}
                    task={editandoTask}
                    onSuccess={onTaskGuardada}
                    onCancel={() => { setMostrarTaskForm(false); setEditandoTask(null); }}
                  />
                )}

                {obraTasks.length === 0 && !mostrarTaskForm && <p style={dimTxt}>Sin tareas. Agregá una con + Tarea.</p>}

                {obraTasks.map(t => (
                  <div key={t.id} style={{ ...card, marginBottom: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <strong style={{ color: "#e0e0e0", fontSize: "13px" }}>{t.titulo}</strong>
                          {t.prioridad && (
                            <span style={{ ...badge, background: prioColor[t.prioridad] + "22", color: prioColor[t.prioridad] }}>
                              {t.prioridad}
                            </span>
                          )}
                          <span style={{ ...badge, background: "#1a1a1a", color: "#444" }}>{t.estado}</span>
                        </div>
                        {t.responsable && <p style={{ color: "#444", margin: "2px 0 4px", fontSize: "12px" }}>👤 {t.responsable}</p>}
                        <p style={{ color: "#333", margin: "0 0 6px", fontSize: "12px" }}>
                          {Number(t.ejecutado).toFixed(2)} / {Number(t.cantidad_total).toFixed(2)} {t.unidad}
                        </p>
                        <ProgresoBar progreso={t.progreso} />
                      </div>
                      <div style={{ display: "flex", gap: "2px", marginLeft: "8px" }}>
                        <button onClick={() => { setEditandoTask(t); setMostrarTaskForm(true); }} style={btnIcon}>✏️</button>
                        <button onClick={() => eliminarTask(t.id)} style={{ ...btnIcon, color: "#e74c3c" }}>✕</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const secTitle = { color: "#e0e0e0", fontSize: "14px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em" };
const formTitle = { color: "#e0e0e0", margin: "0 0 12px", fontSize: "13px", fontWeight: "600" };
const card = { background: "#111", borderRadius: "6px", padding: "12px", border: "1px solid #222" };
const iS = { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "4px", color: "#e0e0e0", padding: "7px 10px", fontSize: "13px" };
const lbl = { display: "block", color: "#555", fontSize: "11px", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" };
const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" };
const btnP = { background: "#2563eb", border: "none", borderRadius: "4px", color: "#fff", cursor: "pointer", padding: "7px 14px", fontWeight: "600", fontSize: "13px" };
const btnS = { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "4px", color: "#666", cursor: "pointer", padding: "7px 12px", fontSize: "13px" };
const btnIcon = { background: "none", border: "none", cursor: "pointer", fontSize: "13px", padding: "3px 5px" };
const badge = { display: "inline-block", borderRadius: "3px", padding: "2px 7px", fontSize: "11px" };
const dimTxt = { color: "#333", fontSize: "13px", margin: "8px 0" };
const errTxt = { color: "#e74c3c", fontSize: "12px", margin: "0 0 8px" };
