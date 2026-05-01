import React, { useMemo } from "react";
import AlertasVencimiento from "../dashboard/AlertasVencimiento";

export default function RightDashboard({
  obras = [],
  tasks = {},
  certificados = [],
}) {
  
  // Memorizamos el cálculo de tareas vencidas para optimizar el rendimiento
  const tareasVencidasCount = useMemo(() => {
    const hoy = new Date();
    return Object.values(tasks)
      .flat()
      .filter((t) => {
        if (!t?.fecha_fin || t.estado === "completada") return false;
        const vencimiento = new Date(t.fecha_fin);
        return vencimiento < hoy;
      }).length;
  }, [tasks]);

  // Cálculos rápidos de estados de obras
  const statsObras = useMemo(() => ({
    activas: obras.filter((o) => o.estado === "en_curso").length,
    pausadas: obras.filter((o) => o.estado === "pausada").length,
  }), [obras]);

  return (
    <aside style={rightPanel}>
      <p style={sectionTitle}>DASHBOARD GENERAL</p>

      {/* Alertas de vencimiento específicas */}
      <AlertasVencimiento
        obras={obras}
        tasks={tasks}
        certificados={certificados}
      />

      {/* Tarjeta de Resumen Global */}
      <div style={card}>
        <p style={sideLabel}>ESTADÍSTICAS</p>

        <div style={statContainer}>
          <StatRow
            label="Obras activas"
            value={statsObras.activas}
            color="#4ade80" 
          />

          <StatRow
            label="Obras pausadas"
            value={statsObras.pausadas}
            color="#fbbf24"
          />

          <StatRow
            label="Tareas vencidas"
            value={tareasVencidasCount}
            color={tareasVencidasCount > 0 ? "#ef4444" : "#888"}
            isCritical={tareasVencidasCount > 0}
          />
        </div>
      </div>

      <div style={footerNote}>
        <p>Actualizado hoy</p>
      </div>
    </aside>
  );
}

function StatRow({ label, value, color = "#fff", isCritical = false }) {
  return (
    <div style={statRow}>
      <span style={statLabel}>{label}</span>
      <span 
        style={{ 
          ...statValue, 
          color: color,
          textShadow: isCritical ? `0 0 8px ${color}44` : "none" 
        }}
      >
        {value}
      </span>
    </div>
  );
}

// --- ESTILOS ---

const rightPanel = {
  background: "#0f0f0f",
  borderLeft: "1px solid #1e1e1e",
  padding: "20px 16px",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "16px"
};

const sectionTitle = {
  color: "#555",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "1px",
  marginBottom: "4px",
};

const card = {
  background: "#141414",
  border: "1px solid #222",
  borderRadius: "12px",
  padding: "16px",
};

const sideLabel = {
  color: "#444",
  fontSize: "10px",
  fontWeight: "700",
  marginBottom: "12px",
  textTransform: "uppercase"
};

const statContainer = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const statRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const statLabel = {
  color: "#aaa",
  fontSize: "13px",
};

const statValue = {
  fontWeight: "700",
  fontSize: "15px",
};

const footerNote = {
  marginTop: "auto",
  padding: "10px",
  textAlign: "center",
  color: "#333",
  fontSize: "10px",
  borderTop: "1px solid #1a1a1a"
};