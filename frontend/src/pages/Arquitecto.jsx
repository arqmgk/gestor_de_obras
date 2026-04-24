import { useEffect, useState } from "react";
import TaskForm from "../components/TaskForm";
import ProgresoBar from "../components/ProgresoBar";
import { getObras, createObra, updateObra, deleteObra, getTasksConProgreso, getProgresoObra, deleteTask } from "../api/api";

const OBRA_EMPTY = { nombre: "", direccion: "", estado: "en_curso", fecha_inicio: "", fecha_fin: "" };

export default function Arquitecto() {
  const [obras, setObras] = useState([]);
  const [obraSeleccionada, setObraSeleccionada] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [progresoObra, setProgresoObra] = useState(null);

  const [obraForm, setObraForm] = useState(OBRA_EMPTY);
  const [editandoObra, setEditandoObra] = useState(null);
  const [mostrarObraForm, setMostrarObraForm] = useState(false);
  const [obraError, setObraError] = useState(null);

  const [mostrarTaskForm, setMostrarTaskForm] = useState(false);
  const [editandoTask, setEditandoTask] = useState(null);

  useEffect(() => { cargarObras(); }, []);

  const cargarObras = async () => setObras(await getObras());

  const cargarDetalle = async (obra) => {
    setObraSeleccionada(obra);
    setMostrarTaskForm(false);
    setEditandoTask(null);
    const [t, p] = await Promise.all([getTasksConProgreso(obra.id), getProgresoObra(obra.id)]);
    setTasks(t);
    setProgresoObra(p);
  };

  const abrirNuevaObra = () => {
    setObraForm(OBRA_EMPTY);
    setEditandoObra(null);
    setObraError(null);
    setMostrarObraForm(true);
  };

  const abrirEditarObra = (e, obra) => {
    e.stopPropagation();
    setObraForm({
      nombre: obra.nombre || "",
      direccion: obra.direccion || "",
      estado: obra.estado || "en_curso",
      fecha_inicio: obra.fecha_inicio ? obra.fecha_inicio.slice(0, 10) : "",
      fecha_fin: obra.fecha_fin ? obra.fecha_fin.slice(0, 10) : "",
    });
    setEditandoObra(obra.id);
    setObraError(null);
    setMostrarObraForm(true);
  };

  const guardarObra = async () => {
    setObraError(null);
    if (!obraForm.nombre) { setObraError("El nombre es obligatorio"); return; }
    const payload = { ...obraForm, fecha_inicio: obraForm.fecha_inicio || null, fecha_fin: obraForm.fecha_fin || null };
    const res = editandoObra ? await updateObra(editandoObra, payload) : await createObra(payload);
    if (res.error) { setObraError(res.error); return; }
    setMostrarObraForm(false);
    setEditandoObra(null);
    await cargarObras();
    if (obraSeleccionada?.id === editandoObra) cargarDetalle(res);
  };

  const eliminarObra = async (e, id) => {
    e.stopPropagation();
    if (!confirm("¿Eliminar obra y todas sus tareas?")) return;
    await deleteObra(id);
    if (obraSeleccionada?.id === id) { setObraSeleccionada(null); setTasks([]); setProgresoObra(null); }
    cargarObras();
  };

  const onTaskGuardada = async () => {
    setMostrarTaskForm(false);
    setEditandoTask(null);
    if (obraSeleccionada) {
      const [t, p] = await Promise.all([getTasksConProgreso(obraSeleccionada.id), getProgresoObra(obraSeleccionada.id)]);
      setTasks(t);
      setProgresoObra(p);
    }
  };

  const eliminarTask = async (id) => {
    if (!confirm("¿Eliminar esta tarea?")) return;
    await deleteTask(id);
    onTaskGuardada();
  };

  const pct = (v) => Math.min(Math.max(Number(v) || 0, 0), 100).toFixed(1);
  const barColor = (v) => v < 30 ? "#e74c3c" : v < 70 ? "#f39c12" : "#27ae60";
  const prioColor = { alta: "#e74c3c", media: "#f39c12", baja: "#27ae60" };
  const estadoLabel = { en_curso: "En curso", pausada: "Pausada", finalizada: "Finalizada" };

  return (
    <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>

      {/* PANEL IZQUIERDO */}
      <div style={{ flex: "1", minWidth: "260px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <span style={sectionTitle}>Obras</span>
          <button onClick={abrirNuevaObra} style={btnP}>+ Nueva</button>
        </div>

        {mostrarObraForm && (
          <div style={card}>
            <p style={formTitle}>{editandoObra ? "Editar obra" : "Nueva obra"}</p>
            {[["nombre", "Nombre *"], ["direccion", "Dirección"]].map(([k, lbl]) => (
              <input key={k} placeholder={lbl} value={obraForm[k]}
                onChange={e => setObraForm({ ...obraForm, [k]: e.target.value })}
                style={{ ...iS, width: "100%", marginBottom: "8px", boxSizing: "border-box" }} />
            ))}
            <div style={grid2mb}>
              <div>
                <label style={lbl}>Inicio <span style={{ color: "#444" }}>(opc.)</span></label>
                <input type="date" value={obraForm.fecha_inicio} onChange={e => setObraForm({ ...obraForm, fecha_inicio: e.target.value })} style={{ ...iS, width: "100%", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={lbl}>Fin <span style={{ color: "#444" }}>(opc.)</span></label>
                <input type="date" value={obraForm.fecha_fin} onChange={e => setObraForm({ ...obraForm, fecha_fin: e.target.value })} style={{ ...iS, width: "100%", boxSizing: "border-box" }} />
              </div>
            </div>
            <select value={obraForm.estado} onChange={e => setObraForm({ ...obraForm, estado: e.target.value })}
              style={{ ...iS, width: "100%", marginBottom: "10px" }}>
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

        {obras.length === 0 && !mostrarObraForm && <p style={emptyTxt}>Sin obras.</p>}
        {obras.map(o => (
          <div key={o.id} onClick={() => cargarDetalle(o)}
            style={{ ...card, cursor: "pointer", borderColor: obraSeleccionada?.id === o.id ? "#2563eb" : "#222" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <strong style={{ color: "#e0e0e0", fontSize: "14px" }}>{o.nombre}</strong>
                {o.direccion && <p style={{ color: "#555", margin: "2px 0", fontSize: "12px" }}>{o.direccion}</p>}
                <span style={{ ...badge, background: o.estado === "en_curso" ? "#0d2a0d" : o.estado === "finalizada" ? "#0d1a2a" : "#2a1a0d", color: o.estado === "en_curso" ? "#4ade80" : o.estado === "finalizada" ? "#60a5fa" : "#fbbf24" }}>
                  {estadoLabel[o.estado] || o.estado}
                </span>
              </div>
              <div style={{ display: "flex", gap: "2px" }}>
                <button onClick={e => abrirEditarObra(e, o)} style={btnIcon} title="Editar">✏️</button>
                <button onClick={e => eliminarObra(e, o.id)} style={{ ...btnIcon, color: "#e74c3c" }} title="Eliminar">✕</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PANEL DERECHO */}
      {obraSeleccionada && (
        <div style={{ flex: "2", minWidth: "300px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={sectionTitle}>{obraSeleccionada.nombre}</span>
            <button onClick={() => { setMostrarTaskForm(true); setEditandoTask(null); }} style={btnP}>+ Tarea</button>
          </div>

          {progresoObra && (
            <div style={{ marginBottom: "18px" }}>
              <p style={{ color: "#555", margin: "0 0 6px", fontSize: "12px" }}>
                Progreso general:&nbsp;
                <strong style={{ color: barColor(progresoObra.progreso) }}>{pct(progresoObra.progreso)}%</strong>
                <span style={{ color: "#444" }}> · {Number(progresoObra.ejecutado).toFixed(2)} / {Number(progresoObra.total).toFixed(2)}</span>
              </p>
              <div style={{ background: "#1a1a1a", borderRadius: "3px", height: "10px", overflow: "hidden" }}>
                <div style={{ background: barColor(progresoObra.progreso), height: "100%", width: `${pct(progresoObra.progreso)}%`, transition: "width 0.4s ease" }} />
              </div>
            </div>
          )}

          {mostrarTaskForm && (
            <TaskForm
              obraId={obraSeleccionada.id}
              task={editandoTask}
              onSuccess={onTaskGuardada}
              onCancel={() => { setMostrarTaskForm(false); setEditandoTask(null); }}
            />
          )}

          <p style={{ ...sectionTitle, fontSize: "12px", marginBottom: "8px" }}>Tareas ({tasks.length})</p>
          {tasks.length === 0 && <p style={emptyTxt}>Sin tareas. Creá una con + Tarea.</p>}
          {tasks.map(t => (
            <div key={t.id} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <strong style={{ color: "#e0e0e0", fontSize: "14px" }}>{t.titulo}</strong>
                    {t.prioridad && <span style={{ ...badge, background: prioColor[t.prioridad] + "22", color: prioColor[t.prioridad] }}>{t.prioridad}</span>}
                    <span style={{ ...badge, background: "#1a1a1a", color: "#555" }}>{t.estado}</span>
                  </div>
                  {t.responsable && <p style={{ color: "#555", margin: "2px 0", fontSize: "12px" }}>👤 {t.responsable}</p>}
                  <p style={{ color: "#444", margin: "4px 0 6px", fontSize: "12px" }}>
                    {Number(t.ejecutado).toFixed(2)} / {Number(t.cantidad_total).toFixed(2)} {t.unidad}
                  </p>
                  <ProgresoBar progreso={t.progreso} />
                </div>
                <div style={{ display: "flex", gap: "2px", marginLeft: "8px" }}>
                  <button onClick={() => { setEditandoTask(t); setMostrarTaskForm(true); }} style={btnIcon} title="Editar">✏️</button>
                  <button onClick={() => eliminarTask(t.id)} style={{ ...btnIcon, color: "#e74c3c" }} title="Eliminar">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const sectionTitle = { color: "#e0e0e0", fontSize: "14px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em" };
const formTitle = { color: "#e0e0e0", margin: "0 0 12px", fontSize: "13px", fontWeight: "600" };
const card = { background: "#111", borderRadius: "6px", padding: "12px", marginBottom: "8px", border: "1px solid #222" };
const iS = { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "4px", color: "#e0e0e0", padding: "7px 10px", fontSize: "13px" };
const lbl = { display: "block", color: "#555", fontSize: "11px", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" };
const grid2mb = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" };
const btnP = { background: "#2563eb", border: "none", borderRadius: "4px", color: "#fff", cursor: "pointer", padding: "7px 14px", fontWeight: "600", fontSize: "13px" };
const btnS = { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "4px", color: "#666", cursor: "pointer", padding: "7px 12px", fontSize: "13px" };
const btnIcon = { background: "none", border: "none", cursor: "pointer", fontSize: "13px", padding: "3px 5px", color: "#444" };
const badge = { display: "inline-block", borderRadius: "3px", padding: "2px 7px", fontSize: "11px" };
const emptyTxt = { color: "#333", fontSize: "13px" };
const errTxt = { color: "#e74c3c", fontSize: "12px", margin: "0 0 8px" };
