import { useState, useEffect } from "react";
import { getUltimosIndices, getIndices, addIndice, deleteIndice, aplicarCoeficiente } from "../api/api";

// ── HELPERS ───────────────────────────────────────────────────────────────────
const fmt    = (n) => Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 });
const fmtMes = (iso) => {
  if (!iso) return "—";
  const [y, m] = iso.slice(0, 7).split("-");
  const meses  = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${meses[Number(m) - 1]} ${y}`;
};

// ── SUBCOMPONENTE: PANEL DE CARGA DE NUEVO ÍNDICE ─────────────────────────────
function FormNuevoIndice({ onAdded }) {
  const [fuente, setFuente] = useState("CAC");
  const [mes,    setMes]    = useState("");
  const [valor,  setValor]  = useState("");
  const [notas,  setNotas]  = useState("");
  const [error,  setError]  = useState(null);
  const [loading,setLoading]= useState(false);

  const handleAdd = async () => {
    setError(null);
    if (!mes)   { setError("Elegí el mes"); return; }
    if (!valor) { setError("Ingresá el valor"); return; }
    setLoading(true);
    try {
      const res = await addIndice({ fuente: fuente.trim(), mes, valor: Number(valor), notas });
      if (res.error) { setError(res.error); }
      else { setMes(""); setValor(""); setNotas(""); onAdded && onAdded(); }
    } catch { setError("Error de conexión"); }
    finally { setLoading(false); }
  };

  return (
    <div style={panelStyle}>
      <p style={sectionTitle}>Cargar nuevo índice</p>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "flex-end" }}>

        <div>
          <label style={lbl}>Fuente</label>
          <input
            value={fuente} onChange={e => setFuente(e.target.value)}
            placeholder="CAC, ICC, …" style={{ ...iS, width: "80px" }}
          />
        </div>

        <div>
          <label style={lbl}>Mes</label>
          <input
            type="month" value={mes} onChange={e => setMes(e.target.value)}
            style={{ ...iS, width: "140px" }}
          />
        </div>

        <div>
          <label style={lbl}>Valor del índice</label>
          <input
            type="number" value={valor} onChange={e => setValor(e.target.value)}
            placeholder="0.00" step="any" min="0"
            style={{ ...iS, width: "130px" }}
          />
        </div>

        <div style={{ flex: 1, minWidth: "120px" }}>
          <label style={lbl}>Notas (opcional)</label>
          <input
            value={notas} onChange={e => setNotas(e.target.value)}
            placeholder="fuente, link, …" style={{ ...iS, width: "100%", boxSizing: "border-box" }}
          />
        </div>

        <button onClick={handleAdd} disabled={loading} style={btnGreen}>
          {loading ? "…" : "Guardar"}
        </button>
      </div>
      {error && <p style={errStyle}>{error}</p>}
    </div>
  );
}

// ── SUBCOMPONENTE: TABLA DE ÍNDICES HISTÓRICOS ────────────────────────────────
function TablaIndices({ indices, onDelete }) {
  if (!indices.length) return (
    <p style={{ color: "#555", fontSize: "12px", margin: "8px 0" }}>
      No hay índices cargados aún.
    </p>
  );

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
      <thead>
        <tr>
          {["Fuente", "Mes", "Valor", "Notas", ""].map(h => (
            <th key={h} style={thStyle}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {indices.map((ind, i) => (
          <tr key={ind.id} style={{ background: i % 2 === 0 ? "#141414" : "#161616" }}>
            <td style={tdStyle}><span style={{ color: "#60a5fa", fontWeight: 600 }}>{ind.fuente}</span></td>
            <td style={tdStyle}>{fmtMes(ind.mes)}</td>
            <td style={{ ...tdStyle, textAlign: "right", color: "#4ade80", fontWeight: 600 }}>
              {fmt(ind.valor)}
            </td>
            <td style={{ ...tdStyle, color: "#555" }}>{ind.notas || "—"}</td>
            <td style={{ ...tdStyle, textAlign: "center" }}>
              <button
                onClick={() => onDelete(ind.id)}
                style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "14px" }}
                title="Eliminar"
              >×</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function ActualizarPrecios({ tasks = [], onActualizado }) {
  const [indices,  setIndices]  = useState([]);
  const [ultimos,  setUltimos]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showAll,  setShowAll]  = useState(false);

  const [fuente,   setFuente]   = useState("");
  const [coef,     setCoef]     = useState("");
  const [mesRef,   setMesRef]   = useState("");
  const [selected, setSelected] = useState([]);
  const [applying, setApplying] = useState(false);
  const [result,   setResult]   = useState(null);
  const [applyErr, setApplyErr] = useState(null);

  const fetchIndices = async () => {
    setLoading(true);
    const [all, ult] = await Promise.all([getIndices(), getUltimosIndices()]);
    setIndices(Array.isArray(all) ? all : []);
    setUltimos(Array.isArray(ult) ? ult : []);
    setLoading(false);
  };

  useEffect(() => { fetchIndices(); }, []);

  useEffect(() => {
    if (!fuente) { setCoef(""); setMesRef(""); return; }
    const ultimo = ultimos.find(u => u.fuente === fuente);
    if (ultimo) { setCoef(String(ultimo.valor)); setMesRef(ultimo.mes); }
  }, [fuente, ultimos]);

  const handleDelete = async (id) => { await deleteIndice(id); fetchIndices(); };

  const toggleTask = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(selected.length === tasksConPrecio.length ? [] : tasksConPrecio.map(t => t.id));

  const handleAplicar = async () => {
    setApplyErr(null); setResult(null);
    if (!fuente)                    { setApplyErr("Elegí una fuente de índice"); return; }
    if (!coef || Number(coef) <= 0) { setApplyErr("El coeficiente debe ser mayor a 0"); return; }
    if (!selected.length)           { setApplyErr("Seleccioná al menos una tarea"); return; }
    setApplying(true);
    try {
      const res = await aplicarCoeficiente({ task_ids: selected, coeficiente: Number(coef), fuente, mes: mesRef });
      if (res.error) { setApplyErr(res.error); }
      else { setResult(res); setSelected([]); onActualizado && onActualizado(); }
    } catch { setApplyErr("Error de conexión"); }
    finally { setApplying(false); }
  };

  const fuentesDisponibles = [...new Set(ultimos.map(u => u.fuente))];
  const tasksConPrecio     = tasks.filter(t => t.precio_unitario);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

      <FormNuevoIndice onAdded={fetchIndices} />

      <div style={panelStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <p style={{ ...sectionTitle, margin: 0 }}>
            Historial de índices{indices.length > 0 ? ` (${indices.length})` : ""}
          </p>
          {indices.length > 5 && (
            <button onClick={() => setShowAll(x => !x)} style={btnGhost}>
              {showAll ? "Ver menos" : "Ver todos"}
            </button>
          )}
        </div>
        {loading
          ? <p style={{ color: "#555", fontSize: "12px" }}>Cargando…</p>
          : <TablaIndices indices={showAll ? indices : indices.slice(0, 5)} onDelete={handleDelete} />
        }
      </div>

      {tasks.length > 0 && (
        <div style={panelStyle}>
          <p style={sectionTitle}>Aplicar actualización de precios</p>

          {tasksConPrecio.length === 0 ? (
            <p style={{ color: "#e74c3c", fontSize: "12px" }}>
              Ninguna tarea de esta obra tiene precio unitario cargado.
            </p>
          ) : (
            <>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "flex-end", marginBottom: "12px" }}>

                <div>
                  <label style={lbl}>Índice</label>
                  <select value={fuente} onChange={e => setFuente(e.target.value)} style={iS}>
                    <option value="">— elegir —</option>
                    {fuentesDisponibles.map(f => {
                      const ult = ultimos.find(u => u.fuente === f);
                      return (
                        <option key={f} value={f}>
                          {f}{ult ? ` · ${fmtMes(ult.mes)} = ${fmt(ult.valor)}` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label style={lbl}>Coeficiente <span style={{ color: "#555", textTransform: "none", letterSpacing: 0 }}>(editable)</span></label>
                  <input
                    type="number" value={coef} onChange={e => setCoef(e.target.value)}
                    placeholder="1.00" step="any" min="0"
                    style={{ ...iS, width: "120px" }}
                  />
                </div>

                {mesRef && (
                  <div style={{ color: "#555", fontSize: "11px", alignSelf: "flex-end", paddingBottom: "8px" }}>
                    Ref: <span style={{ color: "#60a5fa" }}>{fmtMes(mesRef)}</span>
                  </div>
                )}
              </div>

              <p style={{ ...lbl, marginBottom: "6px" }}>
                Tareas a actualizar ({selected.length}/{tasksConPrecio.length} seleccionadas)
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "3px", maxHeight: "220px", overflowY: "auto", marginBottom: "10px" }}>
                <label style={taskRowStyle(false)}>
                  <input
                    type="checkbox"
                    checked={selected.length === tasksConPrecio.length && tasksConPrecio.length > 0}
                    onChange={toggleAll}
                    style={{ marginRight: "8px" }}
                  />
                  <span style={{ color: "#666" }}>Seleccionar todas</span>
                </label>
                {tasksConPrecio.map(t => (
                  <label key={t.id} style={taskRowStyle(selected.includes(t.id))}>
                    <input
                      type="checkbox"
                      checked={selected.includes(t.id)}
                      onChange={() => toggleTask(t.id)}
                      style={{ marginRight: "8px" }}
                    />
                    <span style={{ flex: 1 }}>{t.titulo}</span>
                    <span style={{ color: "#4ade80", marginLeft: "12px", fontVariantNumeric: "tabular-nums" }}>
                      ${fmt(t.precio_unitario)} / {t.unidad}
                    </span>
                    {coef && Number(coef) > 0 && selected.includes(t.id) && (
                      <span style={{ color: "#60a5fa", marginLeft: "10px", fontSize: "11px" }}>
                        → ${fmt(Number(t.precio_unitario) * Number(coef))}
                      </span>
                    )}
                  </label>
                ))}
              </div>

              {applyErr && <p style={errStyle}>{applyErr}</p>}
              {result && (
                <p style={{ color: "#4ade80", fontSize: "12px", margin: "0 0 8px" }}>
                  ✓ {result.actualizadas} tarea{result.actualizadas !== 1 ? "s" : ""} actualizadas · coeficiente {result.coeficiente}
                </p>
              )}

              <button onClick={handleAplicar} disabled={applying} style={btnBlue}>
                {applying ? "Aplicando…" : "Aplicar actualización"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── ESTILOS ───────────────────────────────────────────────────────────────────
const panelStyle   = { background: "#161616", border: "1px solid #2a2a2a", padding: "14px", borderRadius: "6px" };
const sectionTitle = { color: "#888", margin: "0 0 10px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em" };
const lbl          = { color: "#444", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "4px" };
const iS           = { background: "#1e1e1e", border: "1px solid #333", borderRadius: "4px", color: "#e0e0e0", padding: "7px 10px", fontSize: "13px" };
const errStyle     = { color: "#e74c3c", fontSize: "12px", margin: "8px 0 0" };
const thStyle      = { color: "#444", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em", padding: "6px 8px", textAlign: "left", borderBottom: "1px solid #2a2a2a" };
const tdStyle      = { padding: "6px 8px", color: "#ccc", borderBottom: "1px solid #1e1e1e" };
const btnGreen     = { background: "#1a3a1a", border: "1px solid #27ae60", borderRadius: "4px", color: "#4ade80", cursor: "pointer", padding: "7px 18px", fontWeight: "600", fontSize: "13px", alignSelf: "flex-end" };
const btnBlue      = { background: "#1a2a4a", border: "1px solid #2563eb", borderRadius: "4px", color: "#60a5fa", cursor: "pointer", padding: "7px 18px", fontWeight: "600", fontSize: "13px" };
const btnGhost     = { background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "11px", padding: "2px 0" };
const taskRowStyle = (active) => ({
  display: "flex", alignItems: "center", padding: "6px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "12px",
  background: active ? "#1a2a4a" : "#1a1a1a", color: active ? "#e0e0e0" : "#888",
  border: `1px solid ${active ? "#2563eb33" : "transparent"}`,
});
