import React, { useMemo } from "react";
import { SkeletonObraList } from "../shared/Skeletons";

export default function SidebarObras({
  obrasFiltradas = [],
  obraAbierta,
  busqueda,
  setBusqueda,
  toggleObra,
  abrirNuevaObra,
  abrirEditarObra,
  eliminarObra,
  loadingObras,
  estadoColors = {},
  estadoLabel = {},
}) {
  
  // Optimizamos la lista para que no se re-calcule a menos que cambien las dependencias
  const renderObras = useMemo(() => {
    if (loadingObras) return <SkeletonObraList count={5} />;
    
    if (obrasFiltradas.length === 0) {
      return (
        <div style={{ padding: "20px", textAlign: "center", color: "#555", fontSize: "12px" }}>
          No se encontraron obras
        </div>
      );
    }

    return obrasFiltradas.map((o) => {
      const selected = obraAbierta === o.id;
      // Fallback de seguridad para colores
      const ec = estadoColors[o.estado] || { bg: "#222", color: "#888" };

      return (
        <div
          key={o.id}
          onClick={() => toggleObra(o)}
          style={{
            ...obraItem,
            background: selected ? "#1a2a1a" : "transparent",
            borderLeft: `3px solid ${selected ? "#4ade80" : "transparent"}`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span
              style={{
                color: selected ? "#fff" : "#b0b0b0",
                fontWeight: selected ? "700" : "500",
                fontSize: "13px",
                flex: 1,
                paddingRight: "8px"
              }}
            >
              {o.nombre}
            </span>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={(e) => abrirEditarObra(e, o)}
                style={iconBtn}
                title="Editar"
              >
                ✏️
              </button>
              <button
                onClick={(e) => eliminarObra(e, o.id)}
                style={{ ...iconBtn, color: "#ef4444" }}
                title="Eliminar"
              >
                ✕
              </button>
            </div>
          </div>

          {o.direccion && (
            <p style={{ color: "#666", fontSize: "11px", margin: "4px 0" }}>
              {o.direccion}
            </p>
          )}

          <span
            style={{
              ...estadoBadge,
              background: ec.bg,
              color: ec.color,
            }}
          >
            {estadoLabel[o.estado] || o.estado}
          </span>
        </div>
      );
    });
  }, [obrasFiltradas, obraAbierta, loadingObras, estadoColors, estadoLabel]);

  return (
    <aside style={sidebar}>
      <div style={sidebarHeader}>
        <span style={brand}>🏗️ Gestor de Obras</span>
      </div>

      <div style={{ padding: "12px", borderBottom: "1px solid #222" }}>
        <input
          type="text"
          placeholder="Buscar obra..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={sideInput}
        />
      </div>

      <div style={sidebarObras}>
        <div style={sidebarSubHeader}>
          <span style={sideLabel}>
            OBRAS ({obrasFiltradas.length})
          </span>
          <button onClick={abrirNuevaObra} style={addObraBtn}>
            + Nueva
          </button>
        </div>

        {renderObras}
      </div>
    </aside>
  );
}

// --- Objetos de Estilo ---

const sidebar = {
  background: "#0f0f0f",
  borderRight: "1px solid #1e1e1e",
  display: "flex",
  flexDirection: "column",
  height: "100%",
};

const sidebarHeader = {
  padding: "18px 14px",
  borderBottom: "1px solid #1e1e1e",
};

const brand = {
  color: "#fff",
  fontWeight: "700",
  fontSize: "15px",
  letterSpacing: "0.5px"
};

const sidebarObras = {
  flex: 1,
  overflowY: "auto",
};

const sidebarSubHeader = {
  padding: "12px 12px 8px 12px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const sideInput = {
  width: "100%",
  padding: "10px",
  background: "#1a1a1a",
  border: "1px solid #333",
  color: "#fff",
  borderRadius: "6px",
  fontSize: "13px",
  outline: "none",
};

const sideLabel = {
  color: "#555",
  fontSize: "10px",
  fontWeight: "700",
  letterSpacing: "1px"
};

const addObraBtn = {
  background: "#1e3a8a",
  border: "none",
  borderRadius: "4px",
  color: "#fff",
  cursor: "pointer",
  padding: "4px 10px",
  fontSize: "11px",
  fontWeight: "600"
};

const obraItem = {
  padding: "14px 12px",
  borderBottom: "1px solid #1a1a1a",
  cursor: "pointer",
  transition: "all 0.2s ease"
};

const estadoBadge = {
  display: "inline-block",
  borderRadius: "4px",
  padding: "2px 8px",
  fontSize: "10px",
  fontWeight: "700",
  textTransform: "uppercase",
  marginTop: "4px"
};

const iconBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#555",
  fontSize: "12px",
  padding: "2px",
  transition: "color 0.2s"
};