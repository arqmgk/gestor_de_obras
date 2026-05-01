import { useEffect, useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { getFlujoPorMes } from "../api/api";

const fmt = (n) => {
  if (!n && n !== 0) return "—";
  const num = Number(n);
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000)    return `$${(num / 1000).toFixed(0)}K`;
  return `$${num.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;
};

const mesLabel = (mes) => {
  const [y, m] = mes.split("-");
  const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${meses[parseInt(m) - 1]} ${y.slice(2)}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: "6px", padding: "10px 14px", fontSize: "12px" }}>
      <p style={{ color: "#888", margin: "0 0 6px", fontWeight: "600" }}>{mesLabel(label)}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, margin: "2px 0" }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function FlujoPorMes({ obraId }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [vista, setVista]     = useState("mensual"); // mensual | acumulado

  useEffect(() => {
    if (!obraId) return;
    setLoading(true);
    getFlujoPorMes(obraId).then(d => { setData(d); setLoading(false); });
  }, [obraId]);

  if (loading) return <p style={dim}>Cargando flujo...</p>;
  if (!data || !data.flujo?.length) return (
    <p style={dim}>Sin datos de flujo. Cargá fechas en las tareas y emití certificados.</p>
  );

  const chartData = data.flujo.map(f => ({
    mes: f.mes,
    ...(vista === "mensual" ? {
      "Certificado":    f.certificado_mes   || 0,
      "Pagado":         f.pagado_mes        || 0,
      "Curva S (mes)":  f.esperado_mes      || null,
    } : {
      "Certificado acum.": f.certificado_acum  || 0,
      "Pagado acum.":      f.pagado_acum       || 0,
      "Curva S":           f.esperado_acum     || null,
    }),
  }));

  const presupuesto = data.presupuesto_total || 0;
  const certTotal   = data.flujo[data.flujo.length - 1]?.certificado_acum || 0;
  const pagadoTotal = data.flujo[data.flujo.length - 1]?.pagado_acum || 0;

  return (
    <div style={wrap}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
        <span style={title}>Flujo de inversión</span>
        <div style={{ display: "flex", gap: "4px" }}>
          {["mensual", "acumulado"].map(v => (
            <button key={v} onClick={() => setVista(v)} style={{
              background: vista === v ? "#1a2a4a" : "#1a1a1a",
              border: `1px solid ${vista === v ? "#2563eb" : "#2a2a2a"}`,
              borderRadius: "4px", color: vista === v ? "#60a5fa" : "#555",
              cursor: "pointer", padding: "5px 12px", fontSize: "12px",
              fontWeight: vista === v ? "600" : "400", textTransform: "capitalize",
            }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
        <KPI label="Presupuesto" value={fmt(presupuesto)} color="#e0e0e0" />
        <KPI label="Certificado" value={fmt(certTotal)}   color="#2563eb"
             sub={presupuesto > 0 ? `${((certTotal/presupuesto)*100).toFixed(1)}%` : null} />
        <KPI label="Pagado"      value={fmt(pagadoTotal)} color="#4ade80"
             sub={presupuesto > 0 ? `${((pagadoTotal/presupuesto)*100).toFixed(1)}%` : null} />
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
          <XAxis
            dataKey="mes"
            tickFormatter={mesLabel}
            tick={{ fill: "#444", fontSize: 11 }}
            axisLine={{ stroke: "#2a2a2a" }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={v => fmt(v)}
            tick={{ fill: "#444", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={54}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "11px", color: "#555", paddingTop: "8px" }}
            formatter={(v) => <span style={{ color: "#888" }}>{v}</span>}
          />

          {/* Barras */}
          <Bar
            dataKey={vista === "mensual" ? "Certificado" : "Certificado acum."}
            fill="#1d4ed8"
            radius={[3, 3, 0, 0]}
            maxBarSize={40}
          />
          <Bar
            dataKey={vista === "mensual" ? "Pagado" : "Pagado acum."}
            fill="#16a34a"
            radius={[3, 3, 0, 0]}
            maxBarSize={40}
          />

          {/* Línea curva S */}
          <Line
            dataKey={vista === "mensual" ? "Curva S (mes)" : "Curva S"}
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={false}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Nota curva S */}
      {data.fecha_inicio_obra && data.fecha_fin_obra ? (
        <p style={{ color: "#333", fontSize: "11px", margin: "8px 0 0", textAlign: "right" }}>
          Curva S calculada entre {new Date(data.fecha_inicio_obra).toLocaleDateString("es-AR")} y {new Date(data.fecha_fin_obra).toLocaleDateString("es-AR")}
        </p>
      ) : (
        <p style={{ color: "#333", fontSize: "11px", margin: "8px 0 0" }}>
          ℹ Cargá fechas de inicio y fin en las tareas para ver la curva S teórica.
        </p>
      )}
    </div>
  );
}

function KPI({ label, value, color, sub }) {
  return (
    <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "6px", padding: "10px 12px" }}>
      <p style={{ color: "#444", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>{label}</p>
      <p style={{ color, fontWeight: "700", fontSize: "15px", margin: 0 }}>{value}</p>
      {sub && <p style={{ color: "#555", fontSize: "11px", margin: "2px 0 0" }}>{sub} del presupuesto</p>}
    </div>
  );
}

const wrap  = { background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: "8px", padding: "16px", marginBottom: "16px" };
const title = { color: "#888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em" };
const dim   = { color: "#333", fontSize: "13px", margin: "8px 0" };
