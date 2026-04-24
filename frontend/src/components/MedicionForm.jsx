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
    <div style={{ background: "#1e1e1e", padding: "12px", borderRadius: "6px", marginTop: "8px" }}>
      <p style={{ color: "#aaa", margin: "0 0 8px", fontSize: "13px" }}>
        Registrar medición — <strong style={{ color: "#fff" }}>{task.titulo}</strong>
        {task.unidad && <span style={{ color: "#888" }}> ({task.unidad})</span>}
      </p>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <input type="number" placeholder="Cantidad" value={cantidad}
          onChange={e => setCantidad(e.target.value)} style={inputStyle} min="0" step="any" />
        <input type="text" placeholder="Observaciones (opcional)" value={observaciones}
          onChange={e => setObservaciones(e.target.value)} style={{ ...inputStyle, flex: 2 }} />
        <button onClick={handleSubmit} disabled={loading} style={btnStyle}>
          {loading ? "..." : "Guardar"}
        </button>
      </div>
      {error && <p style={{ color: "#e74c3c", margin: "6px 0 0", fontSize: "13px" }}>{error}</p>}
    </div>
  );
}

const inputStyle = { background: "#2c2c2c", border: "1px solid #444", borderRadius: "4px", color: "#fff", padding: "6px 10px", flex: 1, minWidth: "100px" };
const btnStyle = { background: "#2563eb", border: "none", borderRadius: "4px", color: "#fff", cursor: "pointer", padding: "6px 16px", fontWeight: "600" };
