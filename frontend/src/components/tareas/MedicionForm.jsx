import { useState } from "react";
import { addMedicion } from "../api/api";

export default function MedicionForm({ task, onSuccess }) {
  const [cantidad, setCantidad] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    const num = Number(cantidad);
    if (!num || num <= 0) { setError("Ingresá una cantidad válida"); return; }
    setLoading(true);
    try {
      const res = await addMedicion(task.id, { cantidad: num, observaciones });
      if (res.error) { setError(res.error); }
      else { setCantidad(""); setObservaciones(""); onSuccess && onSuccess(); }
    } catch { setError("Error de conexión"); }
    finally { setLoading(false); }
  };

  return (
    <div style={wrapStyle}>
      <p style={{ color: "#888", margin: "0 0 10px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Registrar medición — <span style={{ color: "#e0e0e0" }}>{task.titulo}</span>
        {task.unidad && <span style={{ color: "#555" }}> · {task.unidad}</span>}
      </p>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <input
          type="number"
          placeholder="Cantidad"
          value={cantidad}
          onChange={e => setCantidad(e.target.value)}
          style={iS}
          min="0"
          step="any"
        />
        <input
          type="text"
          placeholder="Observaciones (opcional)"
          value={observaciones}
          onChange={e => setObservaciones(e.target.value)}
          style={{ ...iS, flex: 2 }}
        />
        <button onClick={handleSubmit} disabled={loading} style={btnStyle}>
          {loading ? "..." : "Guardar"}
        </button>
      </div>
      {error && <p style={{ color: "#e74c3c", margin: "8px 0 0", fontSize: "12px" }}>{error}</p>}
    </div>
  );
}

const wrapStyle = { background: "#161616", border: "1px solid #2a2a2a", padding: "14px", borderRadius: "6px", marginTop: "8px" };
const iS = { background: "#1e1e1e", border: "1px solid #333", borderRadius: "4px", color: "#e0e0e0", padding: "7px 10px", flex: 1, minWidth: "100px", fontSize: "13px" };
const btnStyle = { background: "#2563eb", border: "none", borderRadius: "4px", color: "#fff", cursor: "pointer", padding: "7px 18px", fontWeight: "600", fontSize: "13px" };
