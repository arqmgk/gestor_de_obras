import React, { useState, useMemo } from "react";
import ProgresoBar from "../shared/ProgresoBar";
import CertificadoForm from "./CertificadoForm";
import FotoUploader from "./FotoUploader";

// --- HELPERS Y CONSTANTES ---
const fmtCur = (val) =>
  `$${Number(val || 0).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;

const NIVEL_COLOR = {
  ok: { bg: "transparent", color: "#888" },
  leve: { bg: "rgba(251, 191, 36, 0.1)", color: "#fbbf24" },
  grave: { bg: "rgba(239, 68, 68, 0.1)", color: "#ef4444" },
};

export default function TaskCard({
  task,
  certificados = [],
  fotos = [],
  onEdit,
  onDelete,
  onStatusChange, // Para marcar como pagado, etc.
  onCertificadoSuccess,
  fechaStatus, // Función de utilidad para determinar el color/border
  calcDesviosTask,
}) {
  const [certAbierto, setCertAbierto] = useState(false);

  // 1. Cálculos de la tarea
  const stats = useMemo(() => {
    const certs = certificados || [];
    const totalCertificado = certs.reduce((s, c) => s + Number(c.monto), 0);
    const totalPagado = certs
      .filter((c) => c.estado === "pagado")
      .reduce((s, c) => s + Number(c.monto), 0);
    const presupuesto =
      task.precio_unitario && task.cantidad_total
        ? Number(task.precio_unitario) * Number(task.cantidad_total)
        : null;
    
    // Asumimos que fechaStatus devuelve un objeto con estilos
    const statusStyle = fechaStatus ? fechaStatus(task) : { border: "1px solid #222" };
    const desvios = calcDesviosTask ? calcDesviosTask(task, certs) : {};

    return { totalCertificado, totalPagado, presupuesto, statusStyle, desvios };
  }, [task, certificados, fechaStatus, calcDesviosTask]);

  return (
    <div style={{ ...cardStyle, border: stats.statusStyle.border }}>
      {/* HEADER DE LA TAREA */}
      <div style={taskHeader}>
        <div style={{ flex: 1 }}>
          <div style={tagRow}>
            <strong style={taskTitle}>{task.titulo}</strong>
            {task.prioridad && (
              <span style={{ ...badge, color: prioColor[task.prioridad] }}>
                {task.prioridad}
              </span>
            )}
            <span style={stateBadge}>{task.estado}</span>
            {stats.presupuesto && (
              <span style={priceBadge}>{fmtCur(stats.presupuesto)}</span>
            )}
            
            {/* Badges de Desvío */}
            {stats.desvios.plazo?.nivel !== "ok" && (
              <span style={getDesvStyle(stats.desvios.plazo.nivel)}>
                ⏱ {stats.desvios.plazo.desvio.toFixed(0)}%
              </span>
            )}
          </div>

          {task.responsable && <p style={responsableTxt}>👤 {task.responsable}</p>}
          
          <p style={detailTxt}>
            {Number(task.ejecutado).toFixed(2)} / {Number(task.cantidad_total).toFixed(2)} {task.unidad}
            {task.precio_unitario && (
              <span style={unitPrice}> · {fmtCur(task.precio_unitario)} / {task.unidad}</span>
            )}
          </p>
          
          <ProgresoBar progreso={task.progreso} />
        </div>

        {/* ACCIONES */}
        <div style={actionColumn}>
          <button 
            onClick={() => setCertAbierto(!certAbierto)} 
            style={{ ...iconBtn, color: certAbierto ? "#60a5fa" : "#666" }}
            title="Ver Certificados"
          >📋</button>
          <button onClick={() => onEdit(task)} style={iconBtn}>✏️</button>
          <button onClick={() => onDelete(task.id)} style={{ ...iconBtn, color: "#ef4444" }}>✕</button>
        </div>
      </div>

      {/* DESPLEGABLE DE CERTIFICADOS Y FOTOS */}
      {certAbierto && (
        <div style={expandedSection}>
          <CertificadoForm task={task} onSuccess={onCertificadoSuccess} />

          {certificados.length > 0 ? (
            <>
              <div style={historyHeader}>
                <span style={historyTitle}>Historial ({certificados.length})</span>
                <div style={historyStats}>
                  Cert: <span style={{ color: "#60a5fa" }}>{fmtCur(stats.totalCertificado)}</span>
                  {stats.totalPagado > 0 && (
                    <span style={{ marginLeft: "8px" }}>
                      · Pagado: <span style={{ color: "#4ade80" }}>{fmtCur(stats.totalPagado)}</span>
                    </span>
                  )}
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      {["Emisión", "Cant.", "Monto", "Estado", "Pago", ""].map((h) => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {certificados.map((c) => (
                      <tr key={c.id} style={trStyle}>
                        <td style={tdStyle}>{new Date(c.fecha_emision).toLocaleDateString()}</td>
                        <td style={tdStyle}>{Number(c.cantidad_certificada).toFixed(2)}</td>
                        <td style={{ ...tdStyle, color: "#4ade80" }}>{fmtCur(c.monto)}</td>
                        <td style={tdStyle}>
                           <span style={c.estado === 'pagado' ? statusPaid : statusPending}>
                            {c.estado}
                           </span>
                        </td>
                        <td style={tdStyle}>
                          {c.estado === "pagado" ? (
                            <span style={{ opacity: 0.5 }}>{new Date(c.fecha_pago).toLocaleDateString()}</span>
                          ) : (
                            <button 
                              onClick={() => onStatusChange(task.id, c.id, 'pagado')} 
                              style={markPaidBtn}
                            >Marcar pago</button>
                          )}
                        </td>
                        <td style={tdStyle}>
                           <button style={btnSmall}>📄</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p style={emptyTxt}>Sin certificados emitidos.</p>
          )}

          {/* FOTOS */}
          <div style={fotoSection}>
            <p style={historyTitle}>Fotos ({fotos.length})</p>
            <FotoUploader task={task} fotos={fotos} readonly={true} />
          </div>
        </div>
      )}
    </div>
  );
}

// --- ESTILOS (Sugeridos para el objeto 'card') ---
const cardStyle = {
  background: "#141414",
  borderRadius: "8px",
  padding: "12px",
  marginBottom: "8px",
  transition: "all 0.2s"
};

const taskHeader = { display: "flex", justifyContent: "space-between", alignItems: "flex-start" };
const tagRow = { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" };
const taskTitle = { color: "#e8e8e8", fontSize: "14px" };
const responsableTxt = { color: "#666", margin: "0 0 4px", fontSize: "12px" };
const detailTxt = { color: "#888", margin: "0 0 8px", fontSize: "12px" };
const unitPrice = { color: "#444", fontStyle: "italic" };
const actionColumn = { display: "flex", gap: "4px" };
const expandedSection = { marginTop: "12px", borderTop: "1px solid #222", paddingTop: "12px" };

const tableStyle = { width: "100%", borderCollapse: "collapse", marginTop: "8px" };
const thStyle = { textAlign: "left", color: "#444", fontSize: "10px", padding: "4px", textTransform: "uppercase" };
const tdStyle = { padding: "6px 4px", fontSize: "12px", borderBottom: "1px solid #1a1a1a", color: "#ccc" };
const trStyle = { transition: "background 0.2s" };

const iconBtn = { background: "none", border: "none", cursor: "pointer", padding: "4px" };
const markPaidBtn = { background: "#222", border: "1px solid #333", color: "#60a5fa", fontSize: "10px", borderRadius: "4px", cursor: "pointer", padding: "2px 6px" };

const badge = { padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold", background: "rgba(255,255,255,0.05)" };
const stateBadge = { ...badge, color: "#666" };
const priceBadge = { ...badge, background: "#0d1a2a", color: "#60a5fa" };

const getDesvStyle = (nivel) => ({
  ...badge,
  background: NIVEL_COLOR[nivel]?.bg || "transparent",
  color: NIVEL_COLOR[nivel]?.color || "#888"
});

const statusPaid = { color: "#4ade80", fontSize: "11px" };
const statusPending = { color: "#fbbf24", fontSize: "11px" };
const historyHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" };
const historyTitle = { color: "#555", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase" };
const historyStats = { color: "#777", fontSize: "11px" };
const fotoSection = { marginTop: "16px", borderTop: "1px solid #222", paddingTop: "12px" };
const emptyTxt = { color: "#444", fontSize: "12px", marginTop: "10px" };
const btnSmall = { background: "none", border: "none", color: "#2563eb", cursor: "pointer" };
const prioColor = { Alta: "#ef4444", Media: "#fbbf24", Baja: "#60a5fa" };