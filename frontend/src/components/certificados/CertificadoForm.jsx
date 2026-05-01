import { useState, useEffect } from "react";
import { addPago, getUltimosIndices } from "../api/api";

const TIPOS = [
  { value: "anticipo",    label: "Anticipo" },
  { value: "certificado", label: "Certificado" },
  { value: "final",       label: "Final" },
];

const fmt    = (n) => Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 });
const fmtMes = (iso) => {
  if (!iso) return "";
  const [y, m] = iso.slice(0, 7).split("-");
  const meses  = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${meses[Number(m) - 1]} ${y}`;
};

export default function CertificadoForm({ task, onSuccess }) {
  const [tipo,     setTipo]     = useState("certificado");
  const [cantidad, setCantidad] = useState("");
  const [fecha,    setFecha]    = useState("");
  const [obs,      setObs]      = useState("");
  const [error,    setError]    = useState(null);
  const [loading,  setLoading]  = useState(false);

  // ── índice ────────────────────────────────────────────────────────────────
  const [ultimos,     setUltimos]     = useState([]);   // [{fuente, valor, mes}]
  const [fuenteSel,   setFuenteSel]   = useState("");   // fuente elegida
  const [coefEditable,setCoefEditable]= useState("");   // valor editable por el usuario
  const [mesIndice,   setMesIndice]   = useState("");   // mes del índice de referencia

  useEffect(() => {
    getUltimosIndices()
      .then(data => { if (Array.isArray(data)) setUltimos(data); })
      .catch(() => {});
  }, []);

  // Cuando el usuario elige una fuente, pre-carga el último valor como sugerencia
  useEffect(() => {
    if (!fuenteSel) { setCoefEditable(""); setMesIndice(""); return; }
    const u = ultimos.find(x => x.fuente === fuenteSel);
    if (u) { setCoefEditable(String(u.valor)); setMesIndice(u.mes); }
  }, [fuenteSel, ultimos]);

  const precioBase = task.precio_unitario ? Number(task.precio_unitario) : null;
  const cantNum    = Number(cantidad);
  const coefNum    = coefEditable ? Number(coefEditable) : null;

  // Precio efectivo: precio_base * coeficiente (si hay índice) o precio_base solo
  const precioEfectivo = precioBase
    ? (coefNum && coefNum > 0 ? precioBase * coefNum : precioBase)
    : null;

  const montoCalc = precioEfectivo && cantNum > 0
    ? precioEfectivo * cantNum
    : null;

  const handleSubmit = async () => {
    setError(null);
    if (!cantNum || cantNum <= 0) { setError("Ingresá una cantidad válida"); return; }
    if (!precioBase)              { setError("La tarea no tiene precio unitario cargado"); return; }

    setLoading(true);
    try {
      const payload = {
        cantidad_certificada: cantNum,
        monto:                montoCalc,
        tipo,
        observaciones:        obs || null,
        fecha_emision:        fecha || null,
        // campos de índice — sólo si el usuario eligió uno
        precio_base:     precioBase,
        indice_aplicado: fuenteSel && coefNum ? coefNum : null,
        mes_indice:      fuenteSel && mesIndice ? mesIndice : null,
        coeficiente:     fuenteSel && coefNum ? coefNum : null,
        fuente_indice:   fuenteSel || null,
      };

      const res = await addPago(task.id, payload);
      if (res.error) { setError(res.error); }
      else {
        setCantidad(""); setObs(""); setFecha("");
        setFuenteSel(""); setCoefEditable(""); setMesIndice("");
        onSuccess && onSuccess();
      }
    } catch { setError("Error de conexión"); }
    finally { setLoading(false); }
  };

  const hayActualizacion = fuenteSel && coefNum && coefNum !== 1;

  return (
    <div style={wrap}>
      <p style={titleStyle}>
        Emitir certificado —{" "}
        <span style={{ color: "#e0e0e0" }}>{task.titulo}</span>
        {precioBase && (
          <span style={{ color: "#555", marginLeft: "8px", fontSize: "11px" }}>
            ${fmt(precioBase)} / {task.unidad}
          </span>
        )}
      </p>

      {!precioBase && (
        <p style={{ color: "#e74c3c", fontSize: "12px", margin: "0 0 10px" }}>
          ⚠ La tarea no tiene precio unitario. Editala para certificar.
        </p>
      )}

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "flex-end" }}>

        {/* Tipo */}
        <div style={{ display: "flex", gap: "4px" }}>
          {TIPOS.map(t => (
            <button key={t.value} onClick={() => setTipo(t.value)} style={{
              background: tipo === t.value ? "#1a2a4a" : "#1e1e1e",
              border: `1px solid ${tipo === t.value ? "#2563eb" : "#333"}`,
              borderRadius: "4px", color: tipo === t.value ? "#60a5fa" : "#555",
              cursor: "pointer", padding: "6px 10px", fontSize: "12px",
              fontWeight: tipo === t.value ? "600" : "400",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Cantidad */}
        <div>
          <label style={lbl}>Cant. certificada ({task.unidad})</label>
          <input
            type="number" value={cantidad}
            onChange={e => setCantidad(e.target.value)}
            placeholder="0.00" min="0" step="any"
            style={{ ...iS, width: "110px" }}
            disabled={!precioBase}
          />
        </div>

        {/* ── Selector de índice ── */}
        {ultimos.length > 0 && (
          <div>
            <label style={lbl}>Índice de actualización</label>
            <select
              value={fuenteSel}
              onChange={e => setFuenteSel(e.target.value)}
              style={{ ...iS, minWidth: "150px" }}
              disabled={!precioBase}
            >
              <option value="">Sin actualización</option>
              {ultimos.map(u => (
                <option key={u.fuente} value={u.fuente}>
                  {u.fuente} · {fmtMes(u.mes)} = {fmt(u.valor)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Coeficiente editable — sólo si eligió fuente */}
        {fuenteSel && (
          <div>
            <label style={lbl}>
              Coeficiente{" "}
              <span style={{ color: "#555", textTransform: "none", letterSpacing: 0 }}>(editable)</span>
            </label>
            <input
              type="number" value={coefEditable}
              onChange={e => setCoefEditable(e.target.value)}
              placeholder="1.00" step="any" min="0"
              style={{ ...iS, width: "100px" }}
            />
          </div>
        )}

        {/* Precio efectivo → si hay coeficiente distinto de 1, muestra base → actualizado */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <label style={lbl}>Precio efectivo</label>
          <div style={{ ...iS, width: "140px", background: "#141414", color: precioEfectivo ? "#4ade80" : "#333" }}>
            {precioEfectivo ? (
              hayActualizacion ? (
                <span title={`Base: $${fmt(precioBase)}`}>
                  ${fmt(precioEfectivo)}
                  <span style={{ color: "#60a5fa", fontSize: "10px", marginLeft: "4px" }}>
                    ×{Number(coefEditable).toFixed(4)}
                  </span>
                </span>
              ) : `$${fmt(precioEfectivo)}`
            ) : "—"}
          </div>
        </div>

        {/* Monto calculado */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <label style={lbl}>Monto</label>
          <div style={{ ...iS, width: "120px", color: montoCalc ? "#4ade80" : "#333", background: "#141414" }}>
            {montoCalc ? `$${fmt(montoCalc)}` : "—"}
          </div>
        </div>

        {/* Fecha */}
        <div>
          <label style={lbl}>Fecha emisión</label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
            style={{ ...iS, width: "140px" }} />
        </div>

        {/* Observaciones */}
        <div style={{ flex: 2, minWidth: "120px" }}>
          <label style={lbl}>Observaciones</label>
          <input type="text" placeholder="(opcional)" value={obs}
            onChange={e => setObs(e.target.value)}
            style={{ ...iS, width: "100%", boxSizing: "border-box" }} />
        </div>

        <button onClick={handleSubmit} disabled={loading || !precioBase} style={btn}>
          {loading ? "…" : "Emitir"}
        </button>
      </div>

      {/* Disclaimer de actualización */}
      {fuenteSel && coefNum && mesIndice && (
        <p style={disclaimer}>
          Precios actualizados según índice {fuenteSel} · {fmtMes(mesIndice)} (coeficiente {Number(coefEditable).toFixed(6)}).
          Precio base: ${fmt(precioBase)} / {task.unidad}.
        </p>
      )}

      {error && <p style={{ color: "#e74c3c", margin: "8px 0 0", fontSize: "12px" }}>{error}</p>}
    </div>
  );
}

const wrap       = { background: "#161616", border: "1px solid #2a2a2a", padding: "14px", borderRadius: "6px", marginTop: "8px" };
const titleStyle = { color: "#888", margin: "0 0 10px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" };
const lbl        = { color: "#444", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "4px" };
const iS         = { background: "#1e1e1e", border: "1px solid #333", borderRadius: "4px", color: "#e0e0e0", padding: "7px 10px", fontSize: "13px" };
const btn        = { background: "#1a3a1a", border: "1px solid #27ae60", borderRadius: "4px", color: "#4ade80", cursor: "pointer", padding: "7px 18px", fontWeight: "600", fontSize: "13px", alignSelf: "flex-end" };
const disclaimer = { color: "#555", fontSize: "10px", margin: "8px 0 0", fontStyle: "italic", borderTop: "1px solid #222", paddingTop: "6px" };
