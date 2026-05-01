import React, { useState } from "react";
import { 
  SkeletonProgreso, 
  SkeletonTaskList 
} from "../shared/Skeletons";
import Contactos from "../shared/Contactos";
import ResumenDesvios from "../obras/ResumenDesvios";
import FlujoPorMes from "../obras/FlujoPorMes";
import ExportButtons from "../shared/ExportButtons";
import ActualizarPrecios from "./ActualizarPrecios";
import BulkEdit from "./BulkEdit";
import TaskForm from "./TaskForm";

// Helper para formatear moneda
const fmtCur = (val) => 
  `$${Number(val || 0).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;

const pct = (val) => Math.round(val || 0);

export default function ObraDashboard({
  obras = [],
  obraAbierta,
  progreso = {},
  tasks = {},
  certificados = [],
  flujoData = {},
  loadingTasks = {},
  // Funciones pasadas por props (deben venir del padre Arquitecto.jsx)
  recargarTasks,
  onTaskGuardada,
  fechaStatus,
  barColor,
}) {
  const [contactosAbierto, setContactosAbierto] = useState(null);
  const [mostrarActPrecios, setMostrarActPrecios] = useState(false);
  const [mostrarBulkEdit, setMostrarBulkEdit] = useState(false);
  const [mostrarTaskForm, setMostrarTaskForm] = useState(false);
  const [editandoTask, setEditandoTask] = useState(null);

  // 1. Encontrar la obra actual
  const o = obras.find((x) => x.id === obraAbierta);
  if (!o) return null;

  // 2. Preparar datos derivados
  const p = progreso[o.id];
  const obraTasks = tasks[o.id] || [];
  const vencidas = obraTasks.filter((t) => 
    ["vencida_leve", "vencida_grave"].includes(fechaStatus?.(t))
  ).length;

  return (
    <div style={containerStyle}>
      {/* HEADER DE OBRA */}
      <div style={obraHeader}>
        <div>
          <h2 style={obraTitulo}>{o.nombre}</h2>
          {o.direccion && <p style={obraDireccion}>{o.direccion}</p>}
        </div>
        <div style={headerActions}>
          <button style={pdfBtn}>📄 PDF Resumen</button>
          <button
            onClick={() => setContactosAbierto(contactosAbierto === o.id ? null : o.id)}
            style={{ ...pdfBtn, color: contactosAbierto === o.id ? "#ef4444" : "#888" }}
          >
            📞 Contactos
          </button>
        </div>
      </div>

      {/* SECCIÓN CONTACTOS */}
      {contactosAbierto === o.id && (
        <div style={card}>
          <Contactos obraId={o.id} readonly={false} />
        </div>
      )}

      {/* PROGRESO FÍSICO Y FINANCIERO */}
      {loadingTasks[o.id] ? (
        <SkeletonProgreso />
      ) : (
        p && (
          <div style={card}>
            <div style={progressHeader}>
              <span style={sectionTitle}>Progreso físico</span>
              <span style={{ color: barColor(p.general?.progreso), ...progressPct }}>
                {pct(p.general?.progreso)}%
              </span>
            </div>
            
            <div style={progressBarContainer}>
              <div style={{ 
                ...progressBar, 
                background: barColor(p.general?.progreso), 
                width: `${pct(p.general?.progreso)}%` 
              }} />
            </div>

            {/* KPIs FINANCIEROS */}
            {p.general?.presupuesto_total > 0 && (
              <div style={kpiGrid}>
                <div style={kpiBox}>
                  <p style={kpiLabel}>Presupuesto</p>
                  <p style={{ ...kpiVal, color: "#c0c0c0" }}>{fmtCur(p.general.presupuesto_total)}</p>
                </div>
                <div style={kpiBox}>
                  <p style={kpiLabel}>Ejecutado</p>
                  <p style={{ ...kpiVal, color: barColor(p.general.progreso) }}>{fmtCur(p.general.valor_ejecutado)}</p>
                </div>
                <div style={kpiBox}>
                  <p style={kpiLabel}>Pagado</p>
                  <p style={{ ...kpiVal, color: "#60a5fa" }}>{fmtCur(p.general.total_pagado)}</p>
                </div>
              </div>
            )}

            {/* DESGLOSE POR UNIDADES */}
            {p.unidades?.length > 0 && (
              <div style={unidadesContainer}>
                {p.unidades.map((u) => (
                  <div key={u.unidad} style={unidadRow}>
                    <span style={unidadLabel}>{u.unidad}</span>
                    <div style={unidadBarBg}>
                      <div style={{ ...unidadBarFill, background: barColor(u.progreso), width: `${pct(u.progreso)}%` }} />
                    </div>
                    <span style={{ ...unidadPct, color: barColor(u.progreso) }}>{pct(u.progreso)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      )}

      {/* DASHBOARDS SECUNDARIOS */}
      <div style={{ marginTop: "16px" }}>
        <ResumenDesvios obra={p} />
      </div>

      <div style={{ marginTop: "16px" }}>
        <FlujoPorMes obraId={o.id} />
      </div>

      {/* BARRA DE TAREAS */}
      <div style={toolbarTasks}>
        <span style={sectionTitle}>
          Tareas ({obraTasks.length}) 
          {vencidas > 0 && <span style={vencBadge}> ⚠ {vencidas}</span>}
        </span>
        <div style={headerActions}>
          <ExportButtons tasks={obraTasks} obra={o} certificados={certificados} flujo={flujoData[o.id]} />
          <button 
            onClick={() => setMostrarActPrecios(!mostrarActPrecios)} 
            style={{ ...pdfBtn, color: mostrarActPrecios ? "#4ade80" : "#888" }}
          >
            💱 Precios
          </button>
          <button 
            onClick={() => setMostrarBulkEdit(!mostrarBulkEdit)} 
            style={{ ...pdfBtn, color: mostrarBulkEdit ? "#60a5fa" : "#888" }}
          >
            ✏️ Bulk
          </button>
          <button onClick={() => { setMostrarTaskForm(true); setEditandoTask(null); }} style={btnP}>
            + Tarea
          </button>
        </div>
      </div>

      {/* FORMULARIOS Y LISTADO */}
      {mostrarActPrecios && (
        <div style={{ marginBottom: "16px" }}>
          <ActualizarPrecios tasks={obraTasks} obraId={o.id} onUpdated={() => recargarTasks(o.id)} />
        </div>
      )}

      {mostrarBulkEdit && (
        <div style={{ marginBottom: "16px" }}>
          <BulkEdit 
            tasks={obraTasks} 
            obraId={o.id}
            onDone={() => { setMostrarBulkEdit(false); recargarTasks(o.id); }}
            onCancel={() => setMostrarBulkEdit(false)} 
          />
        </div>
      )}

      {mostrarTaskForm && (
        <TaskForm 
          obraId={o.id} 
          task={editandoTask} 
          onSuccess={onTaskGuardada}
          onCancel={() => { setMostrarTaskForm(false); setEditandoTask(null); }} 
        />
      )}

      {loadingTasks[o.id] ? (
        <SkeletonTaskList count={3} />
      ) : obraTasks.length === 0 && !mostrarTaskForm ? (
        <p style={emptyText}>Sin tareas asignadas aún.</p>
      ) : null}
    </div>
  );
}

// Estilos extraídos para limpieza
const containerStyle = { paddingBottom: "40px" };
const obraHeader = { display: "flex", justifyContent: "space-between", marginBottom: "16px", alignItems: "flex-start" };
const obraTitulo = { color: "#fff", margin: 0, fontSize: "24px" };
const obraDireccion = { color: "#666", margin: "4px 0 0", fontSize: "14px" };
const headerActions = { display: "flex", gap: "6px", flexWrap: "wrap" };
const card = { background: "#141414", border: "1px solid #222", borderRadius: "12px", padding: "16px", marginBottom: "16px" };
const sectionTitle = { color: "#888", fontSize: "13px", fontWeight: "700", textTransform: "uppercase" };
const progressHeader = { display: "flex", justifyContent: "space-between", marginBottom: "8px" };
const progressPct = { fontWeight: "700", fontSize: "16px" };
const progressBarContainer = { background: "#222", borderRadius: "4px", height: "10px", overflow: "hidden", marginBottom: "16px" };
const progressBar = { height: "100%", transition: "width 0.4s", borderRadius: "4px" };
const kpiGrid = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" };
const kpiBox = { background: "#0a0a0a", padding: "10px", borderRadius: "8px", border: "1px solid #1a1a1a" };
const kpiLabel = { color: "#555", fontSize: "11px", margin: "0 0 4px 0" };
const kpiVal = { fontSize: "14px", fontWeight: "700", margin: 0 };
const toolbarTasks = { display: "flex", justifyContent: "space-between", alignItems: "center", margin: "24px 0 12px", gap: "8px" };
const vencBadge = { background: "#ef4444", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", marginLeft: "8px" };
const emptyText = { color: "#666", fontSize: "13px", textAlign: "center", padding: "20px" };

// Reutilizo tus botones definidos anteriormente
const pdfBtn = { background: "#1a1a1a", border: "1px solid #333", borderRadius: "6px", color: "#888", padding: "6px 12px", cursor: "pointer", fontSize: "12px" };
const btnP = { background: "#2563eb", border: "none", borderRadius: "6px", color: "#fff", padding: "6px 14px", cursor: "pointer", fontSize: "12px", fontWeight: "600" };

// Reutilizo unidad styles
const unidadesContainer = { display: "flex", flexDirection: "column", gap: "6px" };
const unidadRow = { display: "flex", alignItems: "center", gap: "10px" };
const unidadLabel = { color: "#666", fontSize: "11px", width: "40px", textAlign: "right" };
const unidadBarBg = { flex: 1, background: "#222", height: "6px", borderRadius: "3px", overflow: "hidden" };
const unidadBarFill = { height: "100%", transition: "width 0.4s" };
const unidadPct = { fontSize: "11px", width: "35px", fontWeight: "600" };