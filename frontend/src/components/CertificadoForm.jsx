import { useState } from "react";
import { addPago } from "../api/api";

const TIPOS = [
  { value: "anticipo",    label: "Anticipo" },
  { value: "certificado", label: "Certificado" },
  { value: "final",       label: "Final" },
];

export default function CertificadoForm({ task, onSuccess }) {
  const [tipo, setTipo]           = useState("certificado");
  const [cantidad, setCantidad]   = useState("");
  const [fecha, setFecha]         = useState("");
  const [obs, setObs]             = useState("");
  const [error, setError]         = useState(null);
  const [loading, setLoading]     = useState(false);

  const precioUnit = task.precio_unitario ? Number(task.precio_unitario) : null;
  const cantNum    = Number(cantidad);
  const montoCalc  = precioUnit && cantNum > 0 ? precioUnit * cantNum : null;

  const handleSubmit = async () => {
    setError(null);
    if (!cantNum || cantNum <= 0)  { setError("Ingresá una cantidad válida"); return; }
    if (!precioUnit)               { setError("La tarea no tiene precio unitario cargado"); return; }
    setLoading(true);
    try {
      const res = await addPago(task.id, {
        cantidad_certificada: cantNum,
        monto: montoCalc,
        tipo,
        observaciones: obs || null,
        fecha_emision: fecha || null,
      });
      if (res.error) { setError(res.error); }
      else { setCantidad(""); setObs(""); setFecha(""); onSuccess && onSuccess(); }
    } catch { setError("Error de conexión"); }
    finally { setLoading(false); }
  };

  return (
    <div style={wrap}>
      <p style={titleStyle}>
        Emitir certificado —{" "}
        <span style={{ color: "#e0e0e0" }}>{task.titulo}</span>
        {precioUnit && (
          <span style={{ color: "#555", marginLeft: "8px", fontSize: "11px" }}>
            ${Number(precioUnit).toLocaleString("es-AR")} / {task.unidad}
          </span>
        )}
      </p>

      {!precioUnit && (
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
            style={{ ...iS, width: "120px" }}
            disabled={!precioUnit}
          />
        </div>

        {/* Monto calculado */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <label style={lbl}>Monto</label>
          <div style={{ ...iS, width: "120px", color: montoCalc ? "#4ade80" : "#333", background: "#141414" }}>
            {montoCalc
              ? `$${montoCalc.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
              : "—"}
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
            onChange={e => setObs(e.target.value)} style={{ ...iS, width: "100%", boxSizing: "border-box" }} />
        </div>

        <button onClick={handleSubmit} disabled={loading || !precioUnit} style={btn}>
          {loading ? "..." : "Emitir"}
        </button>
      </div>

      {error && <p style={{ color: "#e74c3c", margin: "8px 0 0", fontSize: "12px" }}>{error}</p>}
    </div>
  );
}

const wrap      = { background: "#161616", border: "1px solid #2a2a2a", padding: "14px", borderRadius: "6px", marginTop: "8px" };
const titleStyle = { color: "#888", margin: "0 0 10px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" };
const lbl       = { color: "#444", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "4px" };
const iS        = { background: "#1e1e1e", border: "1px solid #333", borderRadius: "4px", color: "#e0e0e0", padding: "7px 10px", fontSize: "13px" };
const btn       = { background: "#1a3a1a", border: "1px solid #27ae60", borderRadius: "4px", color: "#4ade80", cursor: "pointer", padding: "7px 18px", fontWeight: "600", fontSize: "13px", alignSelf: "flex-end" };
