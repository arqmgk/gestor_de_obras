import { useEffect, useState } from "react";
import { addMedicion, getObras, getTasksConProgreso, getProgresoTask, getMediciones, getFotos } from "../api/api";
import ParteDiario from "../components/tareas/ParteDiario";
import Contactos from "../components/shared/Contactos";
import FotoUploader from "../components/tareas/FotoUploader";

const PRIO = { alta: 0, media: 1, baja: 2 };

export default function Capataz({ user, onLogout }) {
  const [tab, setTab]             = useState("obras");  // obras | parte | contactos
  const [obras, setObras]         = useState([]);
  const [busqueda, setBusqueda]   = useState("");
  const [obraId, setObraId]       = useState("");
  const [obraNombre, setObraNombre] = useState("");
  const [tasks, setTasks]         = useState([]);
  const [taskAbierta, setTaskAbierta] = useState(null);
  const [mediciones, setMediciones] = useState({});
  const [fotos, setFotos]         = useState({});
  const [loading, setLoading]     = useState(false);

  // Form medición
  const [cantidad, setCantidad]   = useState("");
  const [obs, setObs]             = useState("");
  const [fechaMed, setFechaMed]   = useState("");
  const [formError, setFormError] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [savedOk, setSavedOk]     = useState(false);

  useEffect(() => { getObras().then(setObras); }, []);

  const obrasFiltradas = obras.filter(o =>
    o.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (o.direccion || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const seleccionarObra = async (id, nombre) => {
    setObraId(id); setObraNombre(nombre);
    setTaskAbierta(null); setMediciones({}); setFotos({});
    setBusqueda(""); resetForm();
    if (!id) { setTasks([]); return; }
    setLoading(true);
    const data = await getTasksConProgreso(id);
    setTasks(data.sort((a, b) => (PRIO[a.prioridad] ?? 1) - (PRIO[b.prioridad] ?? 1)));
    setLoading(false);
  };

  const resetForm = () => {
    setCantidad(""); setObs(""); setFechaMed("");
    setFormError(null); setSavedOk(false);
  };

  const toggleTask = async (task) => {
    if (taskAbierta === task.id) { setTaskAbierta(null); resetForm(); return; }
    setTaskAbierta(task.id); resetForm();
    const promises = [];
    if (!mediciones[task.id]) promises.push(getMediciones(task.id).then(m => setMediciones(prev => ({ ...prev, [task.id]: m }))));
    if (!fotos[task.id])      promises.push(getFotos(task.id).then(f => setFotos(prev => ({ ...prev, [task.id]: f }))));
    await Promise.all(promises);
  };

  const guardarMedicion = async (task) => {
    setFormError(null); setSavedOk(false);
    const num = Number(cantidad);
    if (!num || num <= 0) { setFormError("Ingresá una cantidad válida"); return; }
    setSaving(true);
    try {
      const res = await addMedicion(task.id, { cantidad: num, observaciones: obs || null, fecha: fechaMed || null });
      if (res.error) { setFormError(res.error); }
      else {
        const [prog, med] = await Promise.all([getProgresoTask(task.id), getMediciones(task.id)]);
        setMediciones(prev => ({ ...prev, [task.id]: med }));
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, progreso: prog.progreso, ejecutado: prog.ejecutado } : t));
        resetForm(); setSavedOk(true);
        setTimeout(() => setSavedOk(false), 2500);
      }
    } catch { setFormError("Error de conexión"); }
    finally { setSaving(false); }
  };

  const pct      = (v) => Math.min(Math.max(parseFloat(v) || 0, 0), 100).toFixed(1);
  const barColor = (v) => parseFloat(v) < 30 ? "#e74c3c" : parseFloat(v) < 70 ? "#f39c12" : "#27ae60";

  return (
    <div style={shell}>

      {/* ── CONTENIDO ── */}
      <div style={content}>

        {/* TAB: OBRAS / TAREAS */}
        {tab === "obras" && (
          <>
            {!obraId ? (
              <>
                {/* Header */}
                <div style={pageHeader}>
                  <div>
                    <p style={pageTitle}>Mis obras</p>
                    <p style={pageSubtitle}>{user?.nombre}</p>
                  </div>
                  <button onClick={onLogout} style={logoutBtn}>Salir</button>
                </div>

                <input type="search" placeholder="🔍  Buscar obra..."
                  value={busqueda} onChange={e => setBusqueda(e.target.value)}
                  style={searchInput} autoComplete="off" />

                {obras.length === 0 && <p style={dim}>Sin obras asignadas.</p>}

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {obrasFiltradas.map(o => (
                    <button key={o.id} onClick={() => seleccionarObra(String(o.id), o.nombre)} style={obraCard}>
                      <div style={{ textAlign: "left" }}>
                        <span style={{ color: "#e8e8e8", fontWeight: "700", fontSize: "16px", display: "block" }}>{o.nombre}</span>
                        {o.direccion && <span style={{ color: "#888", fontSize: "13px" }}>{o.direccion}</span>}
                      </div>
                      <span style={{ color: "#2563eb", fontSize: "24px" }}>›</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Header obra */}
                <div style={pageHeader}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button onClick={() => seleccionarObra("", "")} style={backBtn}>←</button>
                    <p style={pageTitle}>{obraNombre}</p>
                  </div>
                </div>

                {loading && <p style={dim}>Cargando...</p>}

                {!loading && tasks.length === 0 && <p style={dim}>Esta obra no tiene tareas.</p>}

                {/* TAREAS */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {tasks.map(t => {
                    const abierta = taskAbierta === t.id;
                    const meds    = mediciones[t.id] || [];
                    const progNum = parseFloat(t.progreso) || 0;

                    return (
                      <div key={t.id} style={{ borderRadius: "10px", overflow: "hidden", border: `1px solid ${abierta ? "#2563eb" : "#222"}` }}>

                        <button onClick={() => toggleTask(t)} style={taskHeader}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, paddingRight: "8px" }}>
                              {t.prioridad === "alta"  && <span style={urgBadge}>URGENTE</span>}
                              {t.prioridad === "media" && <span style={mediaBadge}>MEDIA</span>}
                              <span style={{ color: "#e8e8e8", fontWeight: "700", fontSize: "16px", textAlign: "left", lineHeight: "1.3" }}>{t.titulo}</span>
                            </div>
                            <span style={{ color: barColor(t.progreso), fontWeight: "800", fontSize: "18px", flexShrink: 0 }}>{pct(t.progreso)}%</span>
                          </div>
                          {t.responsable && <span style={{ color: "#777", fontSize: "13px", display: "block", marginBottom: "8px" }}>👤 {t.responsable}</span>}
                          <div style={{ background: "#222", borderRadius: "4px", height: "10px", overflow: "hidden", marginBottom: "6px" }}>
                            <div style={{ background: barColor(t.progreso), height: "100%", width: `${progNum}%`, transition: "width 0.4s", borderRadius: "4px" }} />
                          </div>
                          <span style={{ color: "#888", fontSize: "13px" }}>
                            {Number(t.ejecutado).toFixed(2)} / {Number(t.cantidad_total).toFixed(2)} {t.unidad}
                          </span>
                        </button>

                        {abierta && (
                          <div style={{ background: "#0d0d0d", padding: "16px", borderTop: "1px solid #1e1e1e" }}>

                            {/* FORM MEDICIÓN */}
                            <p style={formLabel}>Cargar medición</p>

                            <div style={{ marginBottom: "10px" }}>
                              <label style={inputLabel}>Cantidad ({t.unidad})</label>
                              <input type="number" inputMode="decimal" placeholder="0.00"
                                value={cantidad} onChange={e => setCantidad(e.target.value)}
                                style={bigInput} min="0" step="any" />
                            </div>
                            <div style={{ marginBottom: "10px" }}>
                              <label style={inputLabel}>Fecha <span style={{ color: "#555" }}>(opcional)</span></label>
                              <input type="date" value={fechaMed} onChange={e => setFechaMed(e.target.value)} style={bigInput} />
                            </div>
                            <div style={{ marginBottom: "14px" }}>
                              <label style={inputLabel}>Observaciones <span style={{ color: "#555" }}>(opcional)</span></label>
                              <input type="text" placeholder="ej: frente sur, 2do piso..."
                                value={obs} onChange={e => setObs(e.target.value)} style={bigInput} />
                            </div>
                            {formError && <p style={errTxt}>{formError}</p>}
                            <button onClick={() => guardarMedicion(t)} disabled={saving} style={{
                              ...saveBtn,
                              background: savedOk ? "#16a34a" : "#2563eb",
                            }}>
                              {saving ? "Guardando..." : savedOk ? "✓ Guardado" : "Guardar medición"}
                            </button>

                            {/* HISTORIAL */}
                            {meds.length > 0 && (
                              <>
                                <p style={{ ...formLabel, marginTop: "24px" }}>Historial ({meds.length})</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  {meds.map(m => (
                                    <div key={m.id} style={medRow}>
                                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ color: "#999", fontSize: "13px" }}>{new Date(m.fecha).toLocaleDateString("es-AR")}</span>
                                        <span style={{ color: "#e8e8e8", fontWeight: "700", fontSize: "15px" }}>+{Number(m.cantidad).toFixed(2)} <span style={{ color: "#666", fontWeight: "400", fontSize: "12px" }}>{t.unidad}</span></span>
                                      </div>
                                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3px" }}>
                                        <span style={{ color: "#555", fontSize: "12px" }}>{m.observaciones || ""}</span>
                                        <span style={{ color: "#555", fontSize: "12px" }}>acum: {Number(m.acumulado).toFixed(2)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                            {meds.length === 0 && <p style={{ ...dim, marginTop: "16px" }}>Sin mediciones registradas.</p>}

                            {/* FOTOS */}
                            <p style={{ ...formLabel, marginTop: "24px" }}>Fotos ({(fotos[t.id] || []).length})</p>
                            <FotoUploader task={t} fotos={fotos[t.id] || []}
                              onFotosChange={(nuevas) => setFotos(prev => ({ ...prev, [t.id]: nuevas }))}
                              readonly={false} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* TAB: PARTE DIARIO */}
        {tab === "parte" && (
          <>
            <div style={pageHeader}>
              <p style={pageTitle}>Parte del día</p>
            </div>
            {obraId
              ? <ParteDiario obraId={obraId} />
              : <p style={dim}>Seleccioná una obra primero.</p>
            }
          </>
        )}

        {/* TAB: CONTACTOS */}
        {tab === "contactos" && (
          <>
            <div style={pageHeader}>
              <p style={pageTitle}>Contactos de emergencia</p>
            </div>
            {obraId
              ? <Contactos obraId={obraId} readonly={true} />
              : <p style={dim}>Seleccioná una obra primero.</p>
            }
          </>
        )}
      </div>

      {/* ── NAVBAR AL PIE ── */}
      <nav style={navbar}>
        {[
          { id: "obras",     icon: "🏗️", label: "Obras"       },
          { id: "parte",     icon: "📋", label: "Parte diario" },
          { id: "contactos", icon: "🚨", label: "Emergencias"  },
        ].map(item => (
          <button key={item.id} onClick={() => setTab(item.id)} style={{
            ...navItem,
            color:      tab === item.id ? "#60a5fa" : "#666",
            borderTop:  `2px solid ${tab === item.id ? "#2563eb" : "transparent"}`,
            background: tab === item.id ? "#111" : "none",
          }}>
            <span style={{ fontSize: "20px", display: "block" }}>{item.icon}</span>
            <span style={{ fontSize: "11px", fontWeight: tab === item.id ? "700" : "400" }}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ── ESTILOS ───────────────────────────────────────────────────────────────────
const shell      = { display: "flex", flexDirection: "column", minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Segoe UI', system-ui, sans-serif" };
const content    = { flex: 1, overflowY: "auto", padding: "16px", paddingBottom: "80px", maxWidth: "600px", margin: "0 auto", width: "100%" };
const navbar     = { position: "fixed", bottom: 0, left: 0, right: 0, background: "#0f0f0f", borderTop: "1px solid #1e1e1e", display: "flex", zIndex: 100 };
const navItem    = { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", padding: "10px 4px", border: "none", cursor: "pointer", transition: "all 0.15s" };
const pageHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" };
const pageTitle  = { color: "#e8e8e8", fontSize: "18px", fontWeight: "700", margin: 0 };
const pageSubtitle = { color: "#777", fontSize: "13px", margin: "2px 0 0" };
const logoutBtn  = { background: "none", border: "1px solid #2a2a2a", borderRadius: "6px", color: "#777", cursor: "pointer", padding: "8px 14px", fontSize: "13px" };
const backBtn    = { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "6px", color: "#c0c0c0", cursor: "pointer", padding: "8px 14px", fontSize: "14px" };
const searchInput = { width: "100%", boxSizing: "border-box", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", color: "#d0d0d0", padding: "12px 14px", fontSize: "16px", marginBottom: "14px", outline: "none" };
const obraCard   = { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#141414", border: "1px solid #222", borderRadius: "10px", padding: "16px", cursor: "pointer", width: "100%", textAlign: "left" };
const taskHeader = { width: "100%", background: "#141414", border: "none", cursor: "pointer", padding: "16px", textAlign: "left" };
const urgBadge   = { background: "#2a0d0d", color: "#ef4444", borderRadius: "3px", padding: "2px 6px", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", flexShrink: 0 };
const mediaBadge = { background: "#2a1a0d", color: "#f59e0b", borderRadius: "3px", padding: "2px 6px", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", flexShrink: 0 };
const formLabel  = { color: "#777", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" };
const inputLabel = { display: "block", color: "#666", fontSize: "12px", marginBottom: "6px" };
const bigInput   = { width: "100%", boxSizing: "border-box", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", color: "#d0d0d0", padding: "14px", fontSize: "16px", outline: "none" };
const saveBtn    = { width: "100%", border: "none", borderRadius: "8px", color: "#fff", cursor: "pointer", padding: "16px", fontWeight: "700", fontSize: "16px", marginTop: "4px" };
const medRow     = { background: "#141414", border: "1px solid #1e1e1e", borderRadius: "6px", padding: "10px 12px" };
const errTxt     = { color: "#e74c3c", fontSize: "13px", margin: "0 0 10px" };
const dim        = { color: "#555", fontSize: "14px", margin: "8px 0" };
