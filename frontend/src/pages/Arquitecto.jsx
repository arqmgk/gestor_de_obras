import { useState } from "react";
import { useObras } from "../hooks/useObras";
import { useDashboard } from "../hooks/useDashboard";
import { SkeletonObraList } from "../components/shared/Skeletons";

// ── IMPORTACIÓN DE COMPONENTES (Lo que faltaba) ────────────────
import SidebarHeader from "../components/layout/SidebarObras";
import ObraItemCard from "../components/obras/ObraItemCard";
import ObraForm from "../components/obras/ObraForm";
import DashboardContent from "../components/dashboard/DashboardContent";
import ResumenGlobal from "../components/dashboard/ResumenGlobal";
import { EmptyState, LoadingState } from "../components/shared/States";

export default function Arquitecto({ user, onLogout }) {
  // HOOKS DE LÓGICA
  const { 
    obras, 
    obrasFiltradas, 
    loading: loadingObras, 
    busqueda, 
    setBusqueda, 
    guardarObra, 
    eliminarObra 
  } = useObras();

  const { 
    obraAbiertaId, 
    tasks, 
    progreso, 
    flujo, 
    loading: loadingDash, 
    seleccionarObra 
  } = useDashboard();

  // ESTADOS LOCALES DE UI
  const [mostrarForm, setMostrarForm] = useState(false);
  const [obraEditando, setObraEditando] = useState(null);

  const handleGuardar = async (payload) => {
    const res = await guardarObra(obraEditando?.id, payload);
    if (!res?.error) setMostrarForm(false);
  };

  const obraSeleccionada = obras.find(o => o.id === obraAbiertaId);

  return (
    <div style={appShell}>
      <aside style={sidebar}>
        <SidebarHeader user={user} onLogout={onLogout} />
        
        <div style={searchContainer}>
          <input 
            value={busqueda} 
            onChange={e => setBusqueda(e.target.value)} 
            placeholder="Buscar obra..." 
            style={sideInput}
          />
        </div>

        <div style={sidebarObras}>
          <div style={sideLabelRow}>
            <span>Obras ({obrasFiltradas.length})</span>
            <button 
                style={btnNueva}
                onClick={() => { setObraEditando(null); setMostrarForm(true); }}
            >
                + Nueva
            </button>
          </div>

          {loadingObras ? (
            <SkeletonObraList count={5} />
          ) : (
            obrasFiltradas.map(o => (
              <ObraItemCard 
                key={o.id}
                obra={o}
                isSelected={obraAbiertaId === o.id}
                onSelect={() => seleccionarObra(o.id)}
                onEdit={() => { setObraEditando(o); setMostrarForm(true); }}
                onDelete={() => eliminarObra(o.id)}
              />
            ))
          )}
        </div>
      </aside>

      <main style={mainContent}>
        {mostrarForm && (
          <ObraForm 
            initialData={obraEditando} 
            onSave={handleGuardar} 
            onCancel={() => setMostrarForm(false)} 
          />
        )}

        {!obraAbiertaId ? (
          <EmptyState />
        ) : loadingDash ? (
          <LoadingState />
        ) : (
          <DashboardContent 
            obra={obraSeleccionada}
            progreso={progreso}
            flujo={flujo}
            tasks={tasks}
          />
        )}
      </main>

      <aside style={rightPanel}>
        <ResumenGlobal obras={obras} />
      </aside>
    </div>
  );
}

// ── ESTILOS ──────────────────────────────────────────────────
const appShell = { display: "flex", height: "100vh", width: "100vw", background: "#0a0a0a", color: "#e0e0e0", overflow: "hidden" };
const sidebar = { width: "300px", background: "#111", borderRight: "1px solid #222", display: "flex", flexDirection: "column" };
const mainContent = { flex: 1, padding: "24px", overflowY: "auto", background: "#0d0d0d" };
const rightPanel = { width: "320px", background: "#111", borderLeft: "1px solid #222", padding: "20px", overflowY: "auto" };
const searchContainer = { padding: "16px", borderBottom: "1px solid #222" };
const sideInput = { width: "100%", background: "#1a1a1a", border: "1px solid #333", borderRadius: "6px", padding: "10px", color: "#fff", boxSizing: "border-box" };
const sidebarObras = { flex: 1, overflowY: "auto", padding: "16px" };
const sideLabelRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", fontSize: "12px", color: "#555" };
const btnNueva = { background: "#2563eb", border: "none", borderRadius: "4px", color: "#fff", padding: "4px 8px", fontSize: "11px", cursor: "pointer" };