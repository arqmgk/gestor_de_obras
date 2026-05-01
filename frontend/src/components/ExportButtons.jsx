import {
  exportarTareasCSV,
  exportarTareasExcel,
  exportarFlujoCSV,
  exportPDFObra,
} from "../utils/exportar";

// Props:
//   tasks        — array de tareas con progreso
//   obra         — objeto obra { id, nombre }
//   certificados — objeto { [taskId]: [pago, ...] }
//   flujo        — array de filas de flujo (ya desanidado, no { flujo: [...] })
//   indices      — array de índices cargados (opcional, para incluir en Excel)

export default function ExportButtons({ tasks, obra, certificados, flujo, indices }) {
  const token      = localStorage.getItem("token");
  const tieneFlujo = flujo?.length > 0;

  return (
    <div style={wrap}>
      <span style={label}>Exportar</span>
      <div style={btns}>

        <button
          onClick={() => exportarTareasExcel(tasks, obra.nombre, certificados, flujo, indices)}
          style={btn}
          title="Exportar tareas, flujo e índices a Excel"
        >
          📊 Excel
        </button>

        <button
          onClick={() => exportarTareasCSV(tasks, obra.nombre, certificados)}
          style={btn}
          title="Exportar tareas a CSV"
        >
          📄 CSV tareas
        </button>

        {tieneFlujo && (
          <button
            onClick={() => exportarFlujoCSV(flujo, obra.nombre)}
            style={btn}
            title="Exportar flujo de inversión a CSV"
          >
            📄 CSV flujo
          </button>
        )}

        <button
          onClick={() => exportPDFObra(obra.id, token)}
          style={btn}
          title="Abrir resumen PDF de la obra"
        >
          🖨️ PDF
        </button>

      </div>
    </div>
  );
}

const wrap  = { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" };
const label = { color: "#666", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" };
const btns  = { display: "flex", gap: "4px", flexWrap: "wrap" };
const btn   = {
  background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "6px",
  color: "#888", cursor: "pointer", padding: "5px 10px", fontSize: "12px", fontWeight: "500",
};
