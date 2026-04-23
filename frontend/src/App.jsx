import { useState } from "react";
import Arquitecto from "./pages/Arquitecto";
import Capataz from "./pages/Capataz";

export default function App() {
  const [rol, setRol] = useState("arquitecto");

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gestor de Obras 🚀</h1>

      <button onClick={() => setRol("arquitecto")}>
        Arquitecto
      </button>

      <button onClick={() => setRol("capataz")}>
        Capataz
      </button>

      <hr />

      {rol === "arquitecto" && <Arquitecto />}
      {rol === "capataz" && <Capataz />}
    </div>
  );
}
