import { exportarTareasCSV, exportarTareasExcel, exportPDFObra } from "../utils/exportar";

export default function ExportButtons({ tasks, obra, certificados, flujo }) {
  const token = localStorage.getItem("token");

  return (
    <div style={wrap}>
      <span style={label}>Exportar</span>
      <div style={btns}>
        <button
          onClick={() => exportarTareasExcel(tasks, obra.nombre, certificados, flujo?.flujo)}
          style={btn} title="Exportar tareas y flujo a Excel">
          📊 Excel
        </button>
        <button
          onClick={() => exportarTareasCSV(tasks, obra.nombre, certificados)}
          style={btn} title="Exportar tareas a CSV">
          📄 CSV
        </button>
        <button
          onClick={() => exportPDFObra(obra.id, token)}
          style={btn} title="Abrir resumen PDF de la obra">
          🖨️ PDF
        </button>
      </div>
    </div>
  );
}

const wrap  = { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" };
const label = { color: "#666", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" };
const btns  = { display: "flex", gap: "4px" };
const btn   = { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "6px", color: "#888", cursor: "pointer", padding: "5px 10px", fontSize: "12px", fontWeight: "500" };
