// Skeleton base — bloque animado
function SkeletonBlock({ width = "100%", height = "14px", radius = "4px", style = {} }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: "linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
      ...style,
    }} />
  );
}

// CSS de animación — inyectado una sola vez
if (typeof document !== "undefined" && !document.getElementById("skeleton-style")) {
  const style = document.createElement("style");
  style.id = "skeleton-style";
  style.textContent = `
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  document.head.appendChild(style);
}

// Skeleton de una tarea
export function SkeletonTask() {
  return (
    <div style={taskWrap}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <SkeletonBlock width="55%" height="14px" />
        <SkeletonBlock width="36px" height="14px" />
      </div>
      <SkeletonBlock width="35%" height="10px" style={{ marginBottom: "10px" }} />
      <SkeletonBlock width="100%" height="6px" radius="3px" />
    </div>
  );
}

// Skeleton de una obra en el sidebar
export function SkeletonObraItem() {
  return (
    <div style={obraWrap}>
      <SkeletonBlock width="70%" height="13px" style={{ marginBottom: "6px" }} />
      <SkeletonBlock width="45%" height="10px" style={{ marginBottom: "8px" }} />
      <SkeletonBlock width="100%" height="3px" radius="2px" />
    </div>
  );
}

// Skeleton de KPI
export function SkeletonKPI() {
  return (
    <div style={kpiWrap}>
      <SkeletonBlock width="60%" height="10px" style={{ marginBottom: "8px" }} />
      <SkeletonBlock width="80%" height="18px" />
    </div>
  );
}

// Skeleton de panel de progreso completo
export function SkeletonProgreso() {
  return (
    <div style={progresoWrap}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <SkeletonBlock width="40%" height="13px" />
        <SkeletonBlock width="40px" height="18px" />
      </div>
      <SkeletonBlock width="100%" height="10px" radius="4px" style={{ marginBottom: "16px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
        <SkeletonKPI />
        <SkeletonKPI />
        <SkeletonKPI />
      </div>
    </div>
  );
}

// Lista de tareas skeleton
export function SkeletonTaskList({ count = 3 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {Array.from({ length: count }).map((_, i) => <SkeletonTask key={i} />)}
    </div>
  );
}

// Lista de obras skeleton (sidebar)
export function SkeletonObraList({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => <SkeletonObraItem key={i} />)}
    </>
  );
}

const taskWrap    = { background: "#141414", border: "1px solid #222", borderRadius: "8px", padding: "14px" };
const obraWrap    = { padding: "10px 12px", borderBottom: "1px solid #161616" };
const kpiWrap     = { background: "#1a1a1a", borderRadius: "6px", padding: "10px 12px" };
const progresoWrap = { background: "#141414", border: "1px solid #222", borderRadius: "8px", padding: "14px", marginBottom: "16px" };
