import { useState } from "react";
import { login, register } from "../api/api";

export default function Login({ onLogin }) {
  const [modo, setModo] = useState("login");
  const [form, setForm] = useState({ nombre: "", email: "", password: "", empresa: "", rol: "arquitecto" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    setError(null);
    if (!form.email || !form.password) { setError("Email y contraseña son obligatorios"); return; }
    if (modo === "register" && !form.nombre) { setError("El nombre es obligatorio"); return; }
    if (modo === "register" && !form.empresa) { setError("El nombre de la empresa es obligatorio"); return; }
    setLoading(true);
    try {
      const res = modo === "login"
        ? await login({ email: form.email, password: form.password })
        : await register({ nombre: form.nombre, email: form.email, password: form.password, empresa: form.empresa, rol: form.rol });
      if (res.message && !res.token) { setError(res.message); return; }
      if (!res.token) { setError("Error en el servidor"); return; }
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      onLogin(res.user);
    } catch { setError("Error de conexión"); }
    finally { setLoading(false); }
  };

  return (
    <div style={outerWrap}>
      <div style={box}>
        <p style={logo}>🏗️ Gestor de Obras</p>

        <div style={tabRow}>
          <button onClick={() => { setModo("login"); setError(null); }}
            style={{ ...tab, ...(modo === "login" ? tabActive : {}) }}>Ingresar</button>
          <button onClick={() => { setModo("register"); setError(null); }}
            style={{ ...tab, ...(modo === "register" ? tabActive : {}) }}>Registrarse</button>
        </div>

        {modo === "register" && (
          <>
            <label style={lbl}>Nombre completo *</label>
            <input value={form.nombre} onChange={e => set("nombre", e.target.value)}
              placeholder="Juan García" style={iS} autoComplete="name" />

            <label style={lbl}>Empresa *</label>
            <input value={form.empresa} onChange={e => set("empresa", e.target.value)}
              placeholder="Constructora SA" style={iS} />

            <label style={lbl}>Rol *</label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
              {["arquitecto", "capataz"].map(r => (
                <button key={r} onClick={() => set("rol", r)}
                  style={{
                    flex: 1, padding: "8px", border: "1px solid",
                    borderColor: form.rol === r ? "#2563eb" : "#2a2a2a",
                    borderRadius: "4px", cursor: "pointer", fontSize: "13px",
                    background: form.rol === r ? "#1a2a4a" : "#1a1a1a",
                    color: form.rol === r ? "#60a5fa" : "#555",
                    fontWeight: form.rol === r ? "600" : "400",
                  }}>
                  {r === "arquitecto" ? "🏛️ Arquitecto" : "🦺 Capataz"}
                </button>
              ))}
            </div>
          </>
        )}

        <label style={lbl}>Email *</label>
        <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
          placeholder="correo@ejemplo.com" style={iS} autoComplete="email" />

        <label style={lbl}>Contraseña *</label>
        <input type="password" value={form.password} onChange={e => set("password", e.target.value)}
          placeholder="••••••••" style={iS} autoComplete={modo === "login" ? "current-password" : "new-password"} />

        {error && <p style={errTxt}>{error}</p>}

        <button onClick={handleSubmit} disabled={loading} style={btnSubmit}>
          {loading ? "..." : modo === "login" ? "Ingresar" : "Crear cuenta"}
        </button>
      </div>
    </div>
  );
}

const outerWrap = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a" };
const box = { background: "#111", border: "1px solid #222", borderRadius: "8px", padding: "36px 32px", width: "100%", maxWidth: "380px", display: "flex", flexDirection: "column" };
const logo = { color: "#e0e0e0", fontSize: "18px", fontWeight: "700", margin: "0 0 28px", textAlign: "center", letterSpacing: "-0.02em" };
const tabRow = { display: "flex", marginBottom: "24px", background: "#0a0a0a", borderRadius: "5px", padding: "3px" };
const tab = { flex: 1, background: "none", border: "none", color: "#555", cursor: "pointer", padding: "7px", borderRadius: "4px", fontSize: "13px", fontWeight: "500" };
const tabActive = { background: "#1e1e1e", color: "#e0e0e0" };
const lbl = { color: "#555", fontSize: "11px", marginBottom: "5px", display: "block", textTransform: "uppercase", letterSpacing: "0.06em" };
const iS = { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "4px", color: "#e0e0e0", padding: "9px 12px", fontSize: "13px", marginBottom: "14px", width: "100%", boxSizing: "border-box", display: "block" };
const btnSubmit = { background: "#2563eb", border: "none", borderRadius: "4px", color: "#fff", cursor: "pointer", padding: "10px", fontWeight: "700", fontSize: "14px", width: "100%", marginTop: "4px" };
const errTxt = { color: "#e74c3c", fontSize: "12px", margin: "0 0 12px" };
