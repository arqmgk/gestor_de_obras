import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Arquitecto from "./pages/Arquitecto";
import Capataz from "./pages/Capataz";

export default function App() {
  const [user, setUser] = useState(null);

  // Restaurar sesión si hay token guardado
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { localStorage.clear(); }
    }
  }, []);

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* TOPBAR */}
      <div style={topbar}>
        <span style={brand}>🏗️ Gestor de Obras</span>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: "#555", fontSize: "12px" }}>
            {user.nombre || user.email}
            <span style={{ ...rolBadge, ...(user.rol === "arquitecto" ? rolArq : rolCap) }}>
              {user.rol}
            </span>
          </span>
          <button onClick={handleLogout} style={btnLogout}>Salir</button>
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{ padding: "24px" }}>
        {user.rol === "arquitecto" && <Arquitecto />}
        {user.rol === "capataz" && <Capataz />}
        {user.rol !== "arquitecto" && user.rol !== "capataz" && (
          <p style={{ color: "#555", textAlign: "center", marginTop: "60px" }}>
            Rol desconocido: <strong>{user.rol}</strong>
          </p>
        )}
      </div>
    </div>
  );
}

const topbar = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "0 24px", height: "52px", background: "#111",
  borderBottom: "1px solid #1e1e1e", position: "sticky", top: 0, zIndex: 100,
};
const brand = { color: "#e0e0e0", fontWeight: "700", fontSize: "14px", letterSpacing: "-0.01em" };
const rolBadge = { display: "inline-block", borderRadius: "3px", padding: "2px 7px", fontSize: "10px", marginLeft: "8px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em" };
const rolArq = { background: "#0d2a0d", color: "#4ade80" };
const rolCap = { background: "#1a1a0d", color: "#fbbf24" };
const btnLogout = { background: "none", border: "1px solid #2a2a2a", borderRadius: "4px", color: "#555", cursor: "pointer", padding: "5px 12px", fontSize: "12px" };
