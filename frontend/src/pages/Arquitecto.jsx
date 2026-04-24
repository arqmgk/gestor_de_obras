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

  // formulario obra
  const [obraForm, setObraForm] = useState(OBRA_EMPTY);
  const [editandoObra, setEditandoObra] = useState(null); // null = nueva, id = editar
  const [mostrarObraForm, setMostrarObraForm] = useState(false);
  const [obraError, setObraError] = useState(null);

  // formulario task
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
    const payload = {
      ...obraForm,
      fecha_inicio: obraForm.fecha_inicio || null,
      fecha_fin: obraForm.fecha_fin || null,
    };
    const res = editandoObra
      ? await updateObra(editandoObra, payload)
      : await createObra(payload);
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

  return (
    <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>

      {/* PANEL IZQUIERDO: Obras */}
      <div style={{ flex: "1", minWidth: "260px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h2 style={{ margin: 0, color: "#fff" }}>Obras</h2>
          <button onClick={abrirNuevaObra} style={btnPrimary}>+ Nueva</button>
        </div>

        {mostrarObraForm && (
          <div style={cardStyle}>
            <h3 style={{ color: "#fff", margin: "0 0 12px" }}>{editandoObra ? "Editar obra" : "Nueva obra"}</h3>
            {[["nombre", "Nombre *"], ["direccion", "Dirección"]].map(([k, lbl]) => (
              <input key={k} placeholder={lbl} value={obraForm[k]}
                onChange={e => setObraForm({ ...obraForm, [k]: e.target.value })}
                style={{ ...iS, width: "100%", marginBottom: "8px", boxSizing: "border-box" }} />
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
              <div>
                <label style={labelStyle}>Fecha de inicio <span style={{ color: "#555" }}>(opcional)</span></label>
                <input type="date" value={obraForm.fecha_inicio} onChange={e => setObraForm({ ...obraForm, fecha_inicio: e.target.value })} style={{ ...iS, width: "100%", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={labelStyle}>Fecha de fin <span style={{ color: "#555" }}>(opcional)</span></label>
                <input type="date" value={obraForm.fecha_fin} onChange={e => setObraForm({ ...obraForm, fecha_fin: e.target.value })} style={{ ...iS, width: "100%", boxSizing: "border-box" }} />
              </div>
            </div>
            <select value={obraForm.estado} onChange={e => setObraForm({ ...obraForm, estado: e.target.value })}
              style={{ ...iS, width: "100%", marginBottom: "8px" }}>
              <option value="en_curso">En curso</option>
              <option value="pausada">Pausada</option>
              <option value="finalizada">Finalizada</option>
            </select>
            {obraError && <p style={{ color: "#e74c3c", fontSize: "13px", margin: "0 0 8px" }}>{obraError}</p>}
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={guardarObra} style={btnPrimary}>{editandoObra ? "Guardar cambios" : "Crear"}</button>
              <button onClick={() => setMostrarObraForm(false)} style={btnSecondary}>Cancelar</button>
            </div>
          </div>
        )}

        {obras.length === 0 && !mostrarObraForm && <p style={{ color: "#666" }}>No hay obras.</p>}
        {obras.map(o => (
          <div key={o.id} onClick={() => cargarDetalle(o)}
            style={{ ...cardStyle, cursor: "pointer", border: obraSeleccionada?.id === o.id ? "1px solid #2563eb" : "1px solid #333" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <strong style={{ color: "#fff" }}>{o.nombre}</strong>
                {o.direccion && <p style={{ color: "#888", margin: "2px 0", fontSize: "12px" }}>{o.direccion}</p>}
                <span style={{ ...badge, background: o.estado === "en_curso" ? "#1a3a1a" : o.estado === "finalizada" ? "#1a1a3a" : "#3a2a1a" }}>
                  {o.estado}
                </span>
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                <button onClick={e => abrirEditarObra(e, o)} style={btnIcon} title="Editar">✏️</button>
                <button onClick={e => eliminarObra(e, o.id)} style={{ ...btnIcon, color: "#e74c3c" }} title="Eliminar">✕</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PANEL DERECHO: Detalle obra + tasks */}
      {obraSeleccionada && (
        <div style={{ flex: "2", minWidth: "300px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <h2 style={{ color: "#fff", margin: 0 }}>{obraSeleccionada.nombre}</h2>
            <button onClick={() => { setMostrarTaskForm(true); setEditandoTask(null); }} style={btnPrimary}>+ Tarea</button>
          </div>

          {progresoObra && (
            <div style={{ marginBottom: "16px" }}>
              <p style={{ color: "#aaa", margin: "0 0 4px", fontSize: "13px" }}>
                Progreso general: <strong style={{ color: "#fff" }}>{pct(progresoObra.progreso)}%</strong>
                &nbsp;({Number(progresoObra.ejecutado).toFixed(2)} / {Number(progresoObra.total).toFixed(2)})
              </p>
              <div style={{ background: "#333", borderRadius: "4px", height: "12px", overflow: "hidden" }}>
                <div style={{ background: barColor(progresoObra.progreso), height: "100%", width: `${pct(progresoObra.progreso)}%`, transition: "width 0.3s" }} />
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

          <h3 style={{ color: "#ccc", margin: "0 0 8px" }}>Tareas ({tasks.length})</h3>
          {tasks.length === 0 && <p style={{ color: "#666" }}>Sin tareas. Creá una con el botón + Tarea.</p>}
          {tasks.map(t => (
            <div key={t.id} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <strong style={{ color: "#fff" }}>{t.titulo}</strong>
                    {t.prioridad && <span style={{ ...badge, background: prioColor[t.prioridad] + "33", color: prioColor[t.prioridad] }}>{t.prioridad}</span>}
                    <span style={{ ...badge, background: "#222" }}>{t.estado}</span>
                  </div>
                  {t.responsable && <p style={{ color: "#888", margin: "2px 0", fontSize: "12px" }}>👤 {t.responsable}</p>}
                  <p style={{ color: "#aaa", margin: "2px 0 6px", fontSize: "13px" }}>
                    {Number(t.ejecutado).toFixed(2)} / {Number(t.cantidad_total).toFixed(2)} {t.unidad}
                  </p>
                  <ProgresoBar progreso={t.progreso} />
                </div>
                <div style={{ display: "flex", gap: "4px", marginLeft: "8px" }}>
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

const labelStyle = { display: "block", color: "#888", fontSize: "12px", marginBottom: "4px" };
const cardStyle = { background: "#1a1a1a", borderRadius: "8px", padding: "12px", marginBottom: "10px", border: "1px solid #333" };
const iS = { background: "#2c2c2c", border: "1px solid #444", borderRadius: "4px", color: "#fff", padding: "6px 10px" };
const btnPrimary = { background: "#2563eb", border: "none", borderRadius: "4px", color: "#fff", cursor: "pointer", padding: "7px 14px", fontWeight: "600" };
const btnSecondary = { background: "#333", border: "none", borderRadius: "4px", color: "#aaa", cursor: "pointer", padding: "7px 14px" };
const btnIcon = { background: "none", border: "none", cursor: "pointer", fontSize: "14px", padding: "2px 4px", color: "#888" };
const badge = { display: "inline-block", borderRadius: "4px", padding: "2px 7px", fontSize: "11px", color: "#aaa" };
