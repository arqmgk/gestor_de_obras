import { useState, useEffect } from "react";
import { getContactos, addContacto, deleteContacto } from "../../api/api.js";

const ROLES_EMERGENCIA = [
  "ART", "Hospital / Guardia", "SAME / Emergencias",
  "Bomberos", "Policía", "Médico laboral",
];

const ROLES_OBRA = [
  "Arquitecto / Director de obra", "Comitente / Dueño",
  "Contratista principal", "Sanitarista", "Electricista",
  "Gasista", "Proveedor materiales", "Municipio / Inspector",
  "Otro",
];

export default function Contactos({ obraId, readonly = false }) {
  const [contactos, setContactos]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);

  // Form
  const [nombre, setNombre]           = useState("");
  const [rol, setRol]                 = useState("ART");
  const [rolCustom, setRolCustom]     = useState("");
  const [telefono, setTelefono]       = useState("");
  const [direccion, setDireccion]     = useState("");
  const [obs, setObs]                 = useState("");
  const [esEmergencia, setEsEmergencia] = useState(true);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState(null);

  useEffect(() => { cargar(); }, [obraId]);

  const cargar = async () => {
    setLoading(true);
    const data = await getContactos(obraId);
    setContactos(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const resetForm = () => {
    setNombre(""); setTelefono(""); setDireccion(""); setObs("");
    setRol("ART"); setRolCustom(""); setEsEmergencia(true);
    setError(null);
  };

  const handleAdd = async () => {
    setError(null);
    const rolFinal = rol === "Otro" ? rolCustom.trim() : rol;
    if (!nombre.trim()) { setError("El nombre es obligatorio"); return; }
    if (!rolFinal)      { setError("El rol es obligatorio"); return; }
    setSaving(true);
    const res = await addContacto(obraId, {
      nombre: nombre.trim(), rol: rolFinal,
      telefono: telefono.trim() || null,
      direccion: direccion.trim() || null,
      observaciones: obs.trim() || null,
      es_emergencia: esEmergencia,
    });
    if (res.error) { setError(res.error); }
    else {
      setContactos(prev => [...prev, res].sort((a, b) =>
        b.es_emergencia - a.es_emergencia
      ));
      resetForm(); setMostrarForm(false);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este contacto?")) return;
    await deleteContacto(id);
    setContactos(prev => prev.filter(c => c.id !== id));
  };

  const emergencias = contactos.filter(c => c.es_emergencia);
  const generales   = contactos.filter(c => !c.es_emergencia);

  if (loading) return <p style={dim}>Cargando contactos...</p>;

  return (
    <div>

      {/* ── EMERGENCIAS ── */}
      {emergencias.length > 0 && (
        <div style={emergWrap}>
          <p style={emergTitle}>🚨 Emergencias</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {emergencias.map(c => (
              <ContactoCard key={c.id} c={c} readonly={readonly} onDelete={handleDelete} urgente />
            ))}
          </div>
        </div>
      )}

      {emergencias.length === 0 && (
        <div style={{ ...emergWrap, opacity: 0.5 }}>
          <p style={emergTitle}>🚨 Emergencias</p>
          <p style={dim}>Sin contactos de emergencia cargados.</p>
        </div>
      )}

      {/* ── GENERALES ── */}
      {generales.length > 0 && (
        <div style={{ marginTop: "14px" }}>
          <p style={sectionLabel}>Contactos de obra</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {generales.map(c => (
              <ContactoCard key={c.id} c={c} readonly={readonly} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* ── FORM (solo arquitecto) ── */}
      {!readonly && (
        <div style={{ marginTop: "16px" }}>
          {!mostrarForm ? (
            <button onClick={() => setMostrarForm(true)} style={addBtn}>
              + Agregar contacto
            </button>
          ) : (
            <div style={formWrap}>
              <p style={sectionLabel}>Nuevo contacto</p>

              {/* Tipo */}
              <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                <button
                  onClick={() => { setEsEmergencia(true); setRol("ART"); }}
                  style={{ ...typeBtn, ...(esEmergencia ? typeBtnActive : {}) }}>
                  🚨 Emergencia
                </button>
                <button
                  onClick={() => { setEsEmergencia(false); setRol("Arquitecto / Director de obra"); }}
                  style={{ ...typeBtn, ...(!esEmergencia ? typeBtnActive : {}) }}>
                  📋 General
                </button>
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label style={lbl}>Rol</label>
                <select
                  value={rol}
                  onChange={e => setRol(e.target.value)}
                  style={iS}>
                  {(esEmergencia ? ROLES_EMERGENCIA : ROLES_OBRA).map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {rol === "Otro" && (
                <div style={{ marginBottom: "10px" }}>
                  <label style={lbl}>Especificar rol</label>
                  <input value={rolCustom} onChange={e => setRolCustom(e.target.value)}
                    placeholder="ej: Proveedor hormigón" style={iS} />
                </div>
              )}

              <div style={{ marginBottom: "10px" }}>
                <label style={lbl}>Nombre / Razón social *</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)}
                  placeholder="ej: ART Galeno / Hospital Italiano" style={iS} />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label style={lbl}>Teléfono</label>
                <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)}
                  placeholder="ej: 011-4000-0000" style={iS} />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label style={lbl}>Dirección <span style={{ color: "#333" }}>(opcional)</span></label>
                <input value={direccion} onChange={e => setDireccion(e.target.value)}
                  placeholder="ej: Av. Corrientes 1234" style={iS} />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={lbl}>Observaciones <span style={{ color: "#333" }}>(opcional)</span></label>
                <input value={obs} onChange={e => setObs(e.target.value)}
                  placeholder="ej: N° de póliza 123456" style={iS} />
              </div>

              {error && <p style={errTxt}>{error}</p>}

              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={handleAdd} disabled={saving} style={saveBtn}>
                  {saving ? "..." : "Guardar"}
                </button>
                <button onClick={() => { setMostrarForm(false); resetForm(); }} style={cancelBtn}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── CARD DE CONTACTO ──────────────────────────────────────────────────────────
function ContactoCard({ c, readonly, onDelete, urgente }) {
  return (
    <div style={{ ...cardStyle, border: urgente ? "1px solid #3a1a1a" : "1px solid #1e1e1e" }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginBottom: "4px" }}>
          <span style={{ ...rolBadge, ...(urgente ? rolEmerg : rolGeneral) }}>{c.rol}</span>
          <span style={{ color: "#e0e0e0", fontWeight: "600", fontSize: "14px" }}>{c.nombre}</span>
        </div>
        {c.direccion && (
          <p style={{ color: "#444", fontSize: "12px", margin: "2px 0" }}>📍 {c.direccion}</p>
        )}
        {c.observaciones && (
          <p style={{ color: "#333", fontSize: "12px", margin: "2px 0" }}>{c.observaciones}</p>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end", flexShrink: 0 }}>
        {c.telefono && (
          <a href={`tel:${c.telefono.replace(/\s/g, '')}`} style={callBtn}>
            📞 {c.telefono}
          </a>
        )}
        {!readonly && (
          <button onClick={() => onDelete(c.id)}
            style={{ background: "none", border: "none", color: "#2a2a2a", cursor: "pointer", fontSize: "12px", padding: "2px 4px" }}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

// ── ESTILOS ───────────────────────────────────────────────────────────────────
const emergWrap   = { background: "#1a0d0d", border: "1px solid #3a1a1a", borderRadius: "8px", padding: "14px" };
const emergTitle  = { color: "#ef4444", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" };
const sectionLabel = { color: "#555", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" };
const cardStyle   = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "#111", borderRadius: "8px", padding: "12px 14px", gap: "10px" };
const rolBadge    = { display: "inline-block", borderRadius: "3px", padding: "2px 7px", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 };
const rolEmerg    = { background: "#2a0d0d", color: "#ef4444" };
const rolGeneral  = { background: "#1a1a2a", color: "#60a5fa" };
const callBtn     = { background: "#0d2a0d", border: "1px solid #27ae60", borderRadius: "6px", color: "#4ade80", padding: "6px 12px", fontSize: "13px", fontWeight: "600", textDecoration: "none", display: "inline-block", whiteSpace: "nowrap" };
const formWrap    = { background: "#111", border: "1px solid #222", borderRadius: "8px", padding: "14px" };
const lbl         = { display: "block", color: "#444", fontSize: "12px", marginBottom: "6px" };
const iS          = { width: "100%", boxSizing: "border-box", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "6px", color: "#e0e0e0", padding: "10px", fontSize: "14px", outline: "none" };
const typeBtn     = { flex: 1, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "6px", color: "#555", cursor: "pointer", padding: "8px", fontSize: "13px" };
const typeBtnActive = { background: "#1a2a3a", border: "1px solid #2563eb", color: "#60a5fa", fontWeight: "600" };
const addBtn      = { width: "100%", background: "none", border: "1px dashed #2a2a2a", borderRadius: "8px", color: "#444", cursor: "pointer", padding: "12px", fontSize: "14px" };
const saveBtn     = { background: "#2563eb", border: "none", borderRadius: "6px", color: "#fff", cursor: "pointer", padding: "10px 20px", fontWeight: "600", fontSize: "14px" };
const cancelBtn   = { background: "none", border: "1px solid #2a2a2a", borderRadius: "6px", color: "#555", cursor: "pointer", padding: "10px 16px", fontSize: "14px" };
const errTxt      = { color: "#e74c3c", fontSize: "12px", margin: "0 0 10px" };
const dim         = { color: "#333", fontSize: "13px", margin: "4px 0" };
