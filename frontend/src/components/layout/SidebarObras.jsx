export default function SidebarObras({
  obras,
  obrasFiltradas,
  obraAbierta,
  progreso,
  tasks,
  busqueda,
  setBusqueda,
  toggleObra,
  abrirNuevaObra,
  abrirEditarObra,
  eliminarObra,
  loadingObras,
}) {
  return (
   <aside style={rightPanel}>
        <p style={sectionTitle}>Dashboard</p>
        <AlertasVencimiento obras={obras} tasks={tasks} certificados={certificados} />

        {/* Stats globales */}
        <div style={{ ...card, marginTop: "12px" }}>
          <p style={sideLabel}>Resumen global</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
            <StatRow label="Obras activas" value={obras.filter(o => o.estado === "en_curso").length} color="#4ade80" />
            <StatRow label="Obras pausadas" value={obras.filter(o => o.estado === "pausada").length} color="#fbbf24" />
            <StatRow label="Tareas vencidas" value={Object.values(tasks).flat().filter(t => ["vencida_leve","vencida_grave"].includes(fechaStatus(t))).length} color="#ef4444" />
          </div>
        </div>
      </aside>
  );
}