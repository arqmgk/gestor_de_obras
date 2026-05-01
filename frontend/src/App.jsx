import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Arquitecto from "./pages/Arquitecto";
import Capataz from "./pages/Capataz";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { localStorage.clear(); }
    }
  }, []);

  const handleLogin  = (userData) => setUser(userData);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (!user) return <Login onLogin={handleLogin} />;

  if (user.rol === "capataz") {
    return <Capataz user={user} onLogout={handleLogout} />;
  }

  if (user.rol === "arquitecto") {
    return <Arquitecto user={user} onLogout={handleLogout} />;
  }

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#666" }}>Rol desconocido: <strong>{user.rol}</strong></p>
    </div>
  );
}
