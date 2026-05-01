import { useState, useEffect } from "react";
import { getParte, addPersona, deletePersona, updateParte } from "../../api/api.js";

const ROLES = [
  "Albañil", "Oficial albañil", "Medio oficial",
  "Sanitarista", "Electricista", "Gasista",
  "Carpintero", "Herrero", "Pintor",
  "Yesero", "Impermeabilizador", "Paisajista",
  "Capataz", "Otro",
];

export default function ParteDiario({ obraId }) {
  const [parte, setParte]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [fecha, setFecha]         = useState(hoy());

  // Form nueva persona
  const [nombre, setNombre]       = useState("");
  const [rol, setRol]             = useState("Albañil");
  const [rolCustom, setRolCustom] = useState("");
  const [empresa, setEmpresa]     = useState("");
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState(null);

  // Observaciones
  const [obs, setObs]             = useState("");
  const [savingObs, setSavingObs] = useState(false);

  useEffect(() => { cargar(); }, [obraId, fecha]);

  function hoy() {
    return new Date().toISOString().slice(0, 10);
  }

  const cargar = async () => {
    setLoading(true);
    const data = await getParte(obraId, fecha);
    setParte(data);
    setObs(data?.observaciones || "");
    setLoading(false);
  };

  const handleAddPersona = async () => {
    setError(null);
    const rolFinal = rol === "Otro" ? rolCustom.trim() : rol;
    if (!nombre.trim()) { setError("Ingresá el nombre"); return; }
    if (!rolFinal)      { setError("Ingresá el rol"); return; }
    setSaving(true);
    const res = await addPersona(parte.id, { nombre: nombre.trim(), rol: rolFinal, empresa: empresa.trim() || null });
    if (res.error) { setError(res.error); }
    else {
      setParte(prev => ({ ...prev, personas: [...(prev.personas || []), res] }));
      setNombre(""); setEmpresa(""); setRolCustom("");
    }
    setSaving(false);
  };

  const handleDeletePersona = async (personaId) => {
    await deletePersona(parte.id, personaId);
    setParte(prev => ({ ...prev, personas: prev.personas.filter(p => p.id !== personaId) }));
  };

  const handleSaveObs = async () => {
    setSavingObs(true);
    await updateParte(parte.id, { observaciones: obs });
    setSavingObs(false);
  };

  if (loading) return <p style={dim}>Cargando parte...</p>;

  const personas = parte?.personas || [];
  const porRol   = personas.reduce((acc, p) => {
    acc[p.rol] = (acc[p.rol] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={wrap}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <p style={title}>Parte del día</p>
        <input
          type="date"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          style={dateInput}
        />
      </div>

      {/* RESUMEN RÁPIDO */}
      {personas.length > 0 && (
        <div style={resumenWrap}>
          <span style={resumenNum}>{personas.length}</span>
          <span style={resumenLabel}>persona{personas.length > 1 ? "s" : ""} en obra</span>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginLeft: "8px" }}>
            {Object.entries(porRol).map(([r, n]) => (
              <span key={r} style={rolChip}>{n} {r}</span>
            ))}
          </div>
        </div>
      )}

      {/* FORM AGREGAR PERSONA */}
      <div style={formWrap}>
        <p style={formLabel}>Agregar persona</p>

        <div style={{ marginBottom: "10px" }}>
          <label style={inputLabel}>Nombre</label>
          <input
            type="text"
            placeholder="Juan García"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            style={bigInput}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={inputLabel}>Rol</label>
          <select value={rol} onChange={e => setRol(e.target.value)} style={bigInput}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {rol === "Otro" && (
          <div style={{ marginBottom: "10px" }}>
            <label style={inputLabel}>Especificar rol</label>
            <input
              type="text"
              placeholder="ej: Impermeabilizador"
              value={rolCustom}
              onChange={e => setRolCustom(e.target.value)}
              style={bigInput}
            />
          </div>
        )}

        <div style={{ marginBottom: "14px" }}>
          <label style={inputLabel}>Empresa / Contratista <span style={{ color: "#333" }}>(opcional)</span></label>
          <input
            type="text"
            placeholder="ej: Sanitaria Pérez SRL"
            value={empresa}
            onChange={e => setEmpresa(e.target.value)}
            style={bigInput}
          />
        </div>

        {error && <p style={errTxt}>{error}</p>}

        <button onClick={handleAddPersona} disabled={saving} style={addBtn}>
          {saving ? "..." : "+ Agregar"}
        </button>
      </div>

      {/* LISTA PERSONAS */}
      {personas.length > 0 && (
        <>
          <p style={{ ...formLabel, marginTop: "20px" }}>En obra hoy ({personas.length})</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {personas.map(p => (
              <div key={p.id} style={personaRow}>
                <div style={{ flex: 1 }}>
                  <span style={{ color: "#e0e0e0", fontWeight: "600", fontSize: "14px" }}>{p.nombre}</span>
                  <div style={{ display: "flex", gap: "6px", marginTop: "3px", flexWrap: "wrap" }}>
                    <span style={rolChip}>{p.rol}</span>
                    {p.empresa && <span style={{ ...rolChip, background: "#0d1a2a", color: "#60a5fa" }}>{p.empresa}</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePersona(p.id)}
                  style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: "18px", padding: "4px 8px", flexShrink: 0 }}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {personas.length === 0 && (
        <p style={{ ...dim, marginTop: "8px" }}>Sin personas registradas para este día.</p>
      )}

      {/* OBSERVACIONES */}
      <div style={{ marginTop: "20px" }}>
        <label style={inputLabel}>Observaciones del día <span style={{ color: "#333" }}>(opcional)</span></label>
        <textarea
          placeholder="ej: Llegó tarde el camión de materiales, se suspendió trabajo por lluvia..."
          value={obs}
          onChange={e => setObs(e.target.value)}
          onBlur={handleSaveObs}
          rows={3}
          style={{ ...bigInput, resize: "vertical", fontFamily: "inherit" }}
        />
        {savingObs && <span style={{ color: "#444", fontSize: "11px" }}>Guardando...</span>}
      </div>
    </div>
  );
}

// ── ESTILOS ───────────────────────────────────────────────────────────────────
const wrap       = { background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: "8px", padding: "16px", marginBottom: "16px" };
const title      = { color: "#888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 };
const dateInput  = { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "6px", color: "#e0e0e0", padding: "8px 10px", fontSize: "14px" };
const resumenWrap = { display: "flex", alignItems: "center", gap: "8px", background: "#111", borderRadius: "6px", padding: "10px 14px", marginBottom: "14px", flexWrap: "wrap" };
const resumenNum  = { color: "#4ade80", fontWeight: "800", fontSize: "22px", lineHeight: 1 };
const resumenLabel = { color: "#555", fontSize: "13px" };
const rolChip    = { background: "#1a2a1a", color: "#4ade80", borderRadius: "3px", padding: "2px 7px", fontSize: "11px", fontWeight: "600" };
const formWrap   = { background: "#111", borderRadius: "8px", padding: "14px" };
const formLabel  = { color: "#555", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" };
const inputLabel = { display: "block", color: "#444", fontSize: "12px", marginBottom: "6px" };
const bigInput   = { width: "100%", boxSizing: "border-box", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", color: "#e0e0e0", padding: "14px", fontSize: "16px", outline: "none" };
const addBtn     = { width: "100%", background: "#1a3a1a", border: "1px solid #27ae60", borderRadius: "8px", color: "#4ade80", cursor: "pointer", padding: "14px", fontWeight: "700", fontSize: "15px" };
const personaRow = { display: "flex", alignItems: "center", background: "#111", border: "1px solid #1e1e1e", borderRadius: "8px", padding: "12px 14px", gap: "8px" };
const errTxt     = { color: "#e74c3c", fontSize: "13px", margin: "0 0 10px" };
const dim        = { color: "#333", fontSize: "13px", margin: "8px 0" };
