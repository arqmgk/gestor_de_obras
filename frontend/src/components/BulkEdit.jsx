import { useState } from "react";
import { updateTask } from "../api/api";

const ESTADOS   = ["pendiente", "en_curso", "finalizada"];
const PRIORIDADES = ["alta", "media", "baja"];

export default function BulkEdit({ tasks, obraId, onDone, onCancel }) {
  const [seleccionadas, setSeleccionadas] = useState(new Set());
  const [campo, setCampo]   = useState("estado");
  const [valor, setValor]   = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);
  const [resultado, setResultado] = useState(null);

  const toggleTarea = (id) => {
    setSeleccionadas(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleTodas = () => {
    if (seleccionadas.size === tasks.length) {
      setSeleccionadas(new Set());
    } else {
      setSeleccionadas(new Set(tasks.map(t => t.id)));
    }
  };

  const handleAplicar = async () => {
    if (seleccionadas.size === 0) { setError("Seleccioná al menos una tarea"); return; }
    if (!valor && campo !== "precio_unitario") { setError("Ingresá un valor"); return; }
    setError(null); setSaving(true);

    const tareasSelec = tasks.filter(t => seleccionadas.has(t.id));
    let ok = 0, fail = 0;

    await Promise.all(tareasSelec.map(async t => {
      const payload = {
        titulo:          t.titulo,
        estado:          t.estado,
        obraId:          Number(obraId),
        prioridad:       t.prioridad,
        fecha_inicio:    t.fecha_inicio,
        fecha_fin:       t.fecha_fin,
        responsable:     t.responsable,
        unidad:          t.unidad,
        cantidad_total:  t.cantidad_total,
        precio_unitario: t.precio_unitario,
        [campo]: campo === "precio_unitario" ? (valor === "" ? null : Number(valor)) : valor,
      };
      const res = await updateTask(t.id, payload);
      res.error ? fail++ : ok++;
    }));

    setSaving(false);
    setResultado({ ok, fail });
    if (fail === 0) setTimeout(() => onDone(), 1200);
  };

  return (
    <div style={wrap}>
      <div style={header}>
        <span style={titulo}>Edición en bloque</span>
        <button onClick={onCancel} style={closeBtn}>✕</button>
      </div>

      {/* Selector de campo */}
      <div style={section}>
        <label style={lbl}>Campo a modificar</label>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[
            { id: "estado",          label: "Estado"          },
            { id: "prioridad",       label: "Prioridad"       },
            { id: "responsable",     label: "Responsable"     },
            { id: "precio_unitario", label: "Precio unitario" },
            { id: "fecha_fin",       label: "Fecha fin"       },
          ].map(c => (
            <button key={c.id} onClick={() => { setCampo(c.id); setValor(""); }}
              style={{ ...chipBtn, ...(campo === c.id ? chipActive : {}) }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Valor */}
      <div style={section}>
        <label style={lbl}>Nuevo valor</label>
        {campo === "estado" && (
          <select value={valor} onChange={e => setValor(e.target.value)} style={iS}>
            <option value="">— elegir —</option>
            {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        )}
        {campo === "prioridad" && (
          <select value={valor} onChange={e => setValor(e.target.value)} style={iS}>
            <option value="">— elegir —</option>
            {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        )}
        {campo === "responsable" && (
          <input type="text" placeholder="Nombre del responsable"
            value={valor} onChange={e => setValor(e.target.value)} style={iS} />
        )}
        {campo === "precio_unitario" && (
          <input type="number" placeholder="0.00 (vacío = limpiar precio)"
            value={valor} onChange={e => setValor(e.target.value)}
            min="0" step="any" style={iS} />
        )}
        {campo === "fecha_fin" && (
          <input type="date" value={valor} onChange={e => setValor(e.target.value)} style={iS} />
        )}
      </div>

      {/* Lista de tareas */}
      <div style={section}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <label style={lbl}>Tareas ({seleccionadas.size} seleccionadas)</label>
          <button onClick={toggleTodas} style={selectAllBtn}>
            {seleccionadas.size === tasks.length ? "Deseleccionar todas" : "Seleccionar todas"}
          </button>
        </div>
        <div style={taskList}>
          {tasks.map(t => {
            const sel = seleccionadas.has(t.id);
            return (
              <div key={t.id} onClick={() => toggleTarea(t.id)}
                style={{ ...taskRow, background: sel ? "#1a2a1a" : "#141414", border: `1px solid ${sel ? "#27ae60" : "#222"}` }}>
                <div style={{ ...checkbox, background: sel ? "#27ae60" : "none", border: `2px solid ${sel ? "#27ae60" : "#444"}` }}>
                  {sel && <span style={{ color: "#fff", fontSize: "10px", fontWeight: "700" }}>✓</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "#d0d0d0", fontSize: "13px", fontWeight: "600", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {t.titulo}
                  </p>
                  <p style={{ color: "#666", fontSize: "11px", margin: 0 }}>
                    {t.estado} · {t.prioridad}
                    {t.precio_unitario && ` · $${Number(t.precio_unitario).toLocaleString("es-AR")}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {error && <p style={errTxt}>{error}</p>}

      {resultado && (
        <p style={{ color: resultado.fail === 0 ? "#4ade80" : "#f97316", fontSize: "13px", margin: "0 0 10px" }}>
          {resultado.ok} tarea{resultado.ok !== 1 ? "s" : ""} actualizada{resultado.ok !== 1 ? "s" : ""}
          {resultado.fail > 0 && ` · ${resultado.fail} con error`}
        </p>
      )}

      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={handleAplicar} disabled={saving} style={applyBtn}>
          {saving ? "Aplicando..." : `Aplicar a ${seleccionadas.size} tarea${seleccionadas.size !== 1 ? "s" : ""}`}
        </button>
        <button onClick={onCancel} style={cancelBtn}>Cancelar</button>
      </div>
    </div>
  );
}

const wrap       = { background: "#111", border: "1px solid #2a2a2a", borderRadius: "10px", padding: "20px" };
const header     = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" };
const titulo     = { color: "#e0e0e0", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em" };
const closeBtn   = { background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "16px", padding: "2px 6px" };
const section    = { marginBottom: "16px" };
const lbl        = { display: "block", color: "#777", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" };
const iS         = { width: "100%", boxSizing: "border-box", background: "#1a1a1a", border: "1px solid #333", borderRadius: "6px", color: "#d0d0d0", padding: "10px", fontSize: "14px", outline: "none" };
const chipBtn    = { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "20px", color: "#777", cursor: "pointer", padding: "5px 12px", fontSize: "12px" };
const chipActive = { background: "#1a2a4a", border: "1px solid #2563eb", color: "#60a5fa", fontWeight: "600" };
const selectAllBtn = { background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: "12px", padding: 0 };
const taskList   = { display: "flex", flexDirection: "column", gap: "4px", maxHeight: "240px", overflowY: "auto" };
const taskRow    = { display: "flex", alignItems: "center", gap: "10px", borderRadius: "6px", padding: "10px 12px", cursor: "pointer" };
const checkbox   = { width: "18px", height: "18px", borderRadius: "4px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" };
const errTxt     = { color: "#e74c3c", fontSize: "12px", margin: "0 0 10px" };
const applyBtn   = { flex: 1, background: "#2563eb", border: "none", borderRadius: "6px", color: "#fff", cursor: "pointer", padding: "12px", fontWeight: "700", fontSize: "14px" };
const cancelBtn  = { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "6px", color: "#777", cursor: "pointer", padding: "12px 16px", fontSize: "14px" };
