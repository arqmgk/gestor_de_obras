import { useMemo } from "react";

export default function AlertasVencimiento({ obras, tasks, certificados }) {
  const alertas = useMemo(() => {

    if (!obras || !Array.isArray(obras)) return [];
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const lista = [];
    



    // Tareas vencidas o por vencer
    obras.forEach(obra => {
     const obraTasks = tasks && tasks[obra.id] ? tasks[obra.id] : [];
      obraTasks.forEach(t => {
        if (t.estado === "finalizada" || !t.fecha_fin) return;
        const fin = new Date(t.fecha_fin); fin.setHours(0,0,0,0);
        const diff = Math.round((fin - hoy) / 86400000);

        if (diff < 0) {
          lista.push({
            tipo: "tarea_vencida",
            nivel: diff < -7 ? "grave" : "leve",
            obra: obra.nombre,
            titulo: t.titulo,
            dias: Math.abs(diff),
            texto: `Vencida hace ${Math.abs(diff)} día${Math.abs(diff) > 1 ? "s" : ""}`,
            color: diff < -7 ? "#ef4444" : "#f97316",
            bg:    diff < -7 ? "#2a0d0d" : "#2a1a0d",
          });
        } else if (diff <= 3) {
          lista.push({
            tipo: "tarea_por_vencer",
            nivel: "advertencia",
            obra: obra.nombre,
            titulo: t.titulo,
            dias: diff,
            texto: diff === 0 ? "Vence hoy" : `Vence en ${diff} día${diff > 1 ? "s" : ""}`,
            color: "#facc15",
            bg:    "#2a2a0d",
          });
        }
      });

      // Certificados pendientes de pago (más de 15 días)
      obraTasks.forEach(t => {
        const certs = certificados && certificados[t.id] ? certificados[t.id] : [];
        certs.forEach(c => {
          if (c.estado !== "pendiente") return;
          const emision = new Date(c.fecha_emision); emision.setHours(0,0,0,0);
          const diasPendiente = Math.round((hoy - emision) / 86400000);
          if (diasPendiente >= 15) {
            lista.push({
              tipo: "certificado_pendiente",
              nivel: diasPendiente >= 30 ? "grave" : "leve",
              obra: obra.nombre,
              titulo: t.titulo,
              dias: diasPendiente,
              texto: `Certificado sin cobrar hace ${diasPendiente} días`,
              color: diasPendiente >= 30 ? "#ef4444" : "#60a5fa",
              bg:    diasPendiente >= 30 ? "#2a0d0d" : "#0d1a2a",
              monto: c.monto,
            });
          }
        });
      });
    });

    // Ordenar: grave primero
    return lista.sort((a, b) => {
      const orden = { grave: 0, leve: 1, advertencia: 2 };
      return (orden[a.nivel] ?? 3) - (orden[b.nivel] ?? 3);
    });
  }, [obras, tasks, certificados]);

  if (alertas.length === 0) return null;

  return (
    <div style={wrap}>
      <div style={header}>
        <span style={titulo}>🔔 Alertas</span>
        <span style={count}>{alertas.length}</span>
      </div>
      <div style={lista}>
        {alertas.slice(0, 5).map((a, i) => (
          <div key={i} style={{ ...item, borderLeft: `3px solid ${a.color}`, background: a.bg }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: "#c0c0c0", fontSize: "12px", fontWeight: "600", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {a.titulo}
              </p>
              <p style={{ color: "#666", fontSize: "11px", margin: 0 }}>{a.obra}</p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ color: a.color, fontSize: "11px", fontWeight: "700", margin: "0 0 2px" }}>{a.texto}</p>
              {a.monto && (
                <p style={{ color: "#555", fontSize: "10px", margin: 0 }}>
                  ${Number(a.monto).toLocaleString("es-AR", { minimumFractionDigits: 0 })}
                </p>
              )}
            </div>
          </div>
        ))}
        {alertas.length > 5 && (
          <p style={{ color: "#555", fontSize: "11px", margin: "6px 0 0", textAlign: "center" }}>
            +{alertas.length - 5} alertas más
          </p>
        )}
      </div>
    </div>
  );
}

const wrap   = { background: "#111", border: "1px solid #2a2a2a", borderRadius: "8px", overflow: "hidden" };
const header = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid #1e1e1e" };
const titulo = { color: "#c0c0c0", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em" };
const count  = { background: "#ef4444", color: "#fff", borderRadius: "10px", padding: "1px 7px", fontSize: "11px", fontWeight: "700" };
const lista  = { padding: "8px" };
const item   = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", borderRadius: "5px", padding: "8px 10px", marginBottom: "4px" };
