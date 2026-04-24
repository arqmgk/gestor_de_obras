export default function ProgresoBar({ progreso = 0 }) {
  const pct = Math.min(Math.max(Number(progreso) || 0, 0), 100).toFixed(1);
  const color = pct < 30 ? "#e74c3c" : pct < 70 ? "#f39c12" : "#27ae60";
  return (
    <div style={{ margin: "4px 0" }}>
      <div style={{ background: "#333", borderRadius: "4px", height: "10px", overflow: "hidden" }}>
        <div style={{ background: color, height: "100%", width: `${pct}%`, transition: "width 0.3s ease" }} />
      </div>
      <small style={{ color: "#aaa" }}>{pct}%</small>
    </div>
  );
}
