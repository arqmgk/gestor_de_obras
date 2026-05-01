import { NIVEL_COLOR } from "../utils/desvios";

const fmt = (n) => Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 0 });

export default function ResumenDesvios({ resumen }) {
  if (!resumen) return null;

  const { nivel, atrasadas, sobrecosto, excedidas } = resumen;
  const total = atrasadas.length + sobrecosto.length + excedidas.length;

  if (total === 0) {
    return (
      <div style={{ ...wrap, borderColor: "#1a3a1a" }}>
        <span style={{ color: "#4ade80", fontSize: "12px" }}>✓ Sin desvíos detectados</span>
      </div>
    );
  }

  const nc = NIVEL_COLOR[nivel];

  return (
    <div style={{ ...wrap, borderColor: nc.color + "44" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <span style={{ color: "#555", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Desvíos detectados
        </span>
        <span style={{ ...nivelBadge, background: nc.bg, color: nc.color }}>
          {nc.label} — {total} tarea{total > 1 ? "s" : ""}
        </span>
      </div>

      {/* Atrasos de plazo */}
      {atrasadas.length > 0 && (
        <Section titulo="⏱ Plazo" items={atrasadas} renderItem={t => (
          <DesvioRow
            key={t.id}
            titulo={t.titulo}
            nivel={t.desvio_plazo.nivel}
            detalle={
              `Esperado ${t.desvio_plazo.esperado}% · Real ${t.desvio_plazo.real}% · Desvío ${t.desvio_plazo.desvio.toFixed(1)}%`
            }
          />
        )} />
      )}

      {/* Desvíos de costo */}
      {sobrecosto.length > 0 && (
        <Section titulo="💰 Costo" items={sobrecosto} renderItem={t => (
          <DesvioRow
            key={t.id}
            titulo={t.titulo}
            nivel={t.desvio_costo.nivel}
            detalle={
              `Certificado ${t.desvio_costo.pctCertificado}% del presupuesto · Avance físico ${t.desvio_costo.pctFisico}%`
            }
          />
        )} />
      )}

      {/* Desvíos de cantidad */}
      {excedidas.length > 0 && (
        <Section titulo="📐 Cantidad" items={excedidas} renderItem={t => (
          <DesvioRow
            key={t.id}
            titulo={t.titulo}
            nivel={t.desvio_cantidad.nivel}
            detalle={
              `Ejecutado ${t.desvio_cantidad.ejecutado.toFixed(2)} · Planificado ${t.desvio_cantidad.total.toFixed(2)} · Exceso +${t.desvio_cantidad.exceso.toFixed(2)} (${t.desvio_cantidad.porcentaje}%)`
            }
          />
        )} />
      )}
    </div>
  );
}

function Section({ titulo, items, renderItem }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <p style={{ color: "#444", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>
        {titulo}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {items.map(renderItem)}
      </div>
    </div>
  );
}

function DesvioRow({ titulo, nivel, detalle }) {
  const nc = NIVEL_COLOR[nivel];
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "#111", borderRadius: "4px", padding: "8px 10px", gap: "8px" }}>
      <div style={{ flex: 1 }}>
        <span style={{ color: "#e0e0e0", fontSize: "12px", fontWeight: "600" }}>{titulo}</span>
        <p style={{ color: "#444", fontSize: "11px", margin: "2px 0 0" }}>{detalle}</p>
      </div>
      <span style={{ ...nivelBadge, background: nc.bg, color: nc.color, flexShrink: 0 }}>
        {nc.label}
      </span>
    </div>
  );
}

const wrap      = { background: "#0d0d0d", border: "1px solid", borderRadius: "6px", padding: "12px", marginBottom: "16px" };
const nivelBadge = { display: "inline-block", borderRadius: "3px", padding: "2px 8px", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" };
