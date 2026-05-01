import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ── HELPERS ───────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 });
const fmtFecha = (d) => d ? new Date(d).toLocaleDateString("es-AR") : "";

// ── DATOS DE TAREAS ───────────────────────────────────────────────────────────
function tareasARows(tasks, certificados = {}) {
  return tasks.map(t => {
    const certs = certificados[t.id] || [];
    const totalCert   = certs.reduce((s, c) => s + Number(c.monto), 0);
    const totalPagado = certs.filter(c => c.estado === "pagado").reduce((s, c) => s + Number(c.monto), 0);
    const presupuesto = t.precio_unitario && t.cantidad_total
      ? Number(t.precio_unitario) * Number(t.cantidad_total) : 0;

    return {
      "Tarea":               t.titulo,
      "Estado":              t.estado,
      "Prioridad":           t.prioridad,
      "Responsable":         t.responsable || "",
      "Unidad":              t.unidad,
      "Cantidad total":      Number(t.cantidad_total),
      "Ejecutado":           Number(t.ejecutado || 0),
      "Progreso %":          Number((t.progreso || 0)).toFixed(1),
      "Precio unitario $":   t.precio_unitario ? Number(t.precio_unitario) : "",
      "Presupuesto $":       presupuesto || "",
      "Certificado $":       totalCert || "",
      "Pagado $":            totalPagado || "",
      "Fecha inicio":        fmtFecha(t.fecha_inicio),
      "Fecha fin":           fmtFecha(t.fecha_fin),
    };
  });
}

// ── DATOS DE FLUJO ────────────────────────────────────────────────────────────
function flujoARows(flujo) {
  return flujo.map(f => ({
    "Mes":                 f.mes,
    "Certificado mes $":   f.certificado_mes || 0,
    "Pagado mes $":        f.pagado_mes || 0,
    "Certificado acum. $": f.certificado_acum || 0,
    "Pagado acum. $":      f.pagado_acum || 0,
    "Curva S esperado $":  f.esperado_acum || "",
  }));
}

// ── EXPORT CSV ────────────────────────────────────────────────────────────────
export function exportCSV(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const lines   = [
    headers.join(";"),
    ...rows.map(r => headers.map(h => {
      const val = r[h] ?? "";
      return typeof val === "string" && val.includes(";") ? `"${val}"` : val;
    }).join(";")),
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `${filename}.csv`);
}

// ── EXPORT EXCEL ──────────────────────────────────────────────────────────────
export function exportExcel(sheets, filename) {
  // sheets: [{ name, rows }]
  const wb = XLSX.utils.book_new();

  sheets.forEach(({ name, rows }) => {
    if (!rows.length) return;
    const ws = XLSX.utils.json_to_sheet(rows);

    // Ancho de columnas automático
    const colWidths = Object.keys(rows[0]).map(k => ({
      wch: Math.max(k.length, ...rows.map(r => String(r[k] ?? "").length)) + 2,
    }));
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, name);
  });

  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buf], { type: "application/octet-stream" }), `${filename}.xlsx`);
}

// ── EXPORT PDF (vía endpoint backend) ─────────────────────────────────────────
export function exportPDFObra(obraId, token) {
  const url = `${window.location.origin.replace("5173", "8000")}/api/pdf/certificado/obra/${obraId}?token=${token}`;
  window.open(url, "_blank");
}

// ── FUNCIONES PÚBLICAS ────────────────────────────────────────────────────────

export function exportarTareasCSV(tasks, obraNombre, certificados) {
  exportCSV(tareasARows(tasks, certificados), `tareas-${obraNombre}`);
}

export function exportarTareasExcel(tasks, obraNombre, certificados, flujo) {
  const sheets = [
    { name: "Tareas", rows: tareasARows(tasks, certificados) },
  ];
  if (flujo?.length) {
    sheets.push({ name: "Flujo de inversión", rows: flujoARows(flujo) });
  }
  exportExcel(sheets, `obra-${obraNombre}`);
}

export function exportarFlujoCSV(flujo, obraNombre) {
  exportCSV(flujoARows(flujo), `flujo-${obraNombre}`);
}
