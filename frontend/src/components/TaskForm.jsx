import { useState, useEffect } from "react";
import { createTask, updateTask } from "../api/api";

const EMPTY = { titulo: "", estado: "pendiente", prioridad: "media", unidad: "", cantidad_total: "", responsable: "", fecha_inicio: "", fecha_fin: "" };

export default function TaskForm({ obraId, task, onSuccess, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        titulo: task.titulo || "",
        estado: task.estado || "pendiente",
        prioridad: task.prioridad || "media",
        unidad: task.unidad || "",
        cantidad_total: task.cantidad_total ?? "",
        responsable: task.responsable || "",
        fecha_inicio: task.fecha_inicio ? task.fecha_inicio.slice(0, 10) : "",
        fecha_fin: task.fecha_fin ? task.fecha_fin.slice(0, 10) : "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [task]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const payload = {
        ...form,
        obraId: Number(obraId),
        cantidad_total: Number(form.cantidad_total),
        fecha_inicio: form.fecha_inicio || null,
        fecha_fin: form.fecha_fin || null,
      };
      const res = task ? await updateTask(task.id, payload) : await createTask(payload);
      if (res.error) { setError(res.error); }
      else { onSuccess && onSuccess(res); }
    } catch { setError("Error de conexión"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
      <h3 style={{ color: "#fff", margin: "0 0 16px" }}>{task ? "Editar tarea" : "Nueva tarea"}</h3>

      {/* Título */}
      <label style={labelStyle}>Título *</label>
      <input value={form.titulo} onChange={e => set("titulo", e.target.value)}
        placeholder="Ej: Mampostería planta baja" style={{ ...iS, width: "100%", marginBottom: "12px", boxSizing: "border-box" }} />

      {/* Unidad + Cantidad */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
        <div>
          <label style={labelStyle}>Unidad *</label>
          <input value={form.unidad} onChange={e => set("unidad", e.target.value)}
            placeholder="Ej: m², ml, kg" style={{ ...iS, width: "100%", boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={labelStyle}>Cantidad total *</label>
          <input type="number" value={form.cantidad_total} onChange={e => set("cantidad_total", e.target.value)}
            placeholder="Ej: 150" min="0" step="any" style={{ ...iS, width: "100%", boxSizing: "border-box" }} />
        </div>
      </div>

      {/* Responsable */}
      <label style={labelStyle}>Responsable</label>
      <input value={form.responsable} onChange={e => set("responsable", e.target.value)}
        placeholder="Nombre del responsable" style={{ ...iS, width: "100%", marginBottom: "12px", boxSizing: "border-box" }} />

      {/* Estado + Prioridad */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
        <div>
          <label style={labelStyle}>Estado</label>
          <select value={form.estado} onChange={e => set("estado", e.target.value)} style={{ ...iS, width: "100%", boxSizing: "border-box" }}>
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En progreso</option>
            <option value="finalizada">Finalizada</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Prioridad</label>
          <select value={form.prioridad} onChange={e => set("prioridad", e.target.value)} style={{ ...iS, width: "100%", boxSizing: "border-box" }}>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </div>
      </div>

      {/* Fechas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        <div>
          <label style={labelStyle}>Fecha de inicio <span style={{ color: "#555" }}>(opcional)</span></label>
          <input type="date" value={form.fecha_inicio} onChange={e => set("fecha_inicio", e.target.value)}
            style={{ ...iS, width: "100%", boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={labelStyle}>Fecha de fin <span style={{ color: "#555" }}>(opcional)</span></label>
          <input type="date" value={form.fecha_fin} onChange={e => set("fecha_fin", e.target.value)}
            style={{ ...iS, width: "100%", boxSizing: "border-box" }} />
        </div>
      </div>

      {error && <p style={{ color: "#e74c3c", fontSize: "13px", margin: "0 0 12px" }}>{error}</p>}

      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={handleSubmit} disabled={loading} style={btnPrimary}>
          {loading ? "..." : task ? "Guardar cambios" : "Crear tarea"}
        </button>
        <button onClick={onCancel} style={btnSecondary}>Cancelar</button>
      </div>
    </div>
  );
}

const labelStyle = { display: "block", color: "#888", fontSize: "12px", marginBottom: "4px" };
const iS = { background: "#2c2c2c", border: "1px solid #444", borderRadius: "4px", color: "#fff", padding: "7px 10px" };
const btnPrimary = { background: "#2563eb", border: "none", borderRadius: "4px", color: "#fff", cursor: "pointer", padding: "8px 18px", fontWeight: "600" };
const btnSecondary = { background: "#333", border: "none", borderRadius: "4px", color: "#aaa", cursor: "pointer", padding: "8px 14px" };
