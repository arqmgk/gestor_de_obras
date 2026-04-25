export default function ProgresoBar({ progreso = 0 }) {
  const num = Math.min(Math.max(parseFloat(progreso) || 0, 0), 100);
  const pct = num.toFixed(1);
  const color = num < 30 ? "#e74c3c" : num < 70 ? "#f39c12" : "#27ae60";

  return (
    <div style={{ margin: "4px 0" }}>
      <div style={{ background: "#2a2a2a", borderRadius: "3px", height: "8px", overflow: "hidden" }}>
        <div style={{
          background: color,
          height: "100%",
          width: `${pct}%`,
          transition: "width 0.4s ease"
        }} />
      </div>
      <small style={{ color: "#555", fontSize: "11px" }}>{pct}%</small>
    </div>
  );
}
