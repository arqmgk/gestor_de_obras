import { useEffect, useState } from "react";
import { SkeletonObraList } from "../components/Skeletons";
import ProgresoBar from "../components/ProgresoBar";
import ExportButtons from "../components/ExportButtons";
import ResumenDesvios from "../components/ResumenDesvios";
import FlujoPorMes from "../components/FlujoPorMes";
import AlertasVencimiento from "../components/AlertasVencimiento";
import Contactos from "../components/Contactos";
import { getObras, createObra, updateObra, deleteObra } from "../api/api";
import { getTasksConProgreso, getProgresoObra, getFlujoPorMes } from "../api/api";




const OBRA_EMPTY = {
  nombre: "",
  direccion: "",
  estado: "en_curso",
  fecha_inicio: "",
  fecha_fin: "",
};

const estadoLabel = {
  en_curso: "En curso",
  pausada: "Pausada",
  finalizada: "Finalizada",
};

const estadoColors = {
  en_curso: { bg: "#0d2a0d", color: "#4ade80" },
  finalizada: { bg: "#0d1a2a", color: "#60a5fa" },
  pausada: { bg: "#2a1a0d", color: "#fbbf24" },
};

export default function Arquitecto({ user, onLogout }) {
  const [obras, setObras] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [obraAbierta, setObraAbierta] = useState(null);
  const [loadingObras, setLoadingObras] = useState(true);
  const [tasks, setTasks] = useState({});
  const [progreso, setProgreso] = useState({});
  const [flujoData, setFlujoData] = useState({});


  const [obraForm, setObraForm] = useState(OBRA_EMPTY);
  const [editandoObra, setEditandoObra] = useState(null);
  const [mostrarObraForm, setMostrarObraForm] = useState(false);
  const [obraError, setObraError] = useState(null);

  useEffect(() => {
    cargarObras();
  }, []);

  const cargarObras = async () => {
    try {
      setLoadingObras(true);
      const data = await getObras();
      setObras(data || []);
    } catch (err) {
      console.error("Error cargando obras:", err);
    } finally {
      setLoadingObras(false);
    }
  };

  const obrasFiltradas = obras.filter(o =>
    o.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (o.direccion || "").toLowerCase().includes(busqueda.toLowerCase())
  );

 const toggleObra = async (obra) => {
  if (obraAbierta === obra.id) {
    setObraAbierta(null);
    return;
  }

  setObraAbierta(obra.id);

  try {
    const [tasksData, progresoData, flujoMesData] = await Promise.all([
      getTasksConProgreso(obra.id),
      getProgresoObra(obra.id),
      getFlujoPorMes(obra.id),
    ]);

    setTasks(prev => ({
      ...prev,
      [obra.id]: tasksData,
    }));

    setProgreso(prev => ({
      ...prev,
      [obra.id]: progresoData,
    }));

    setFlujoData(prev => ({
      ...prev,
      [obra.id]: flujoMesData,
    }));

  } catch (err) {
    console.error("Error cargando dashboard:", err);
  }
};



  const abrirNuevaObra = () => {
    setObraForm(OBRA_EMPTY);
    setEditandoObra(null);
    setObraError(null);
    setMostrarObraForm(true);
  };

  const abrirEditarObra = (e, obra) => {
    e.stopPropagation();

    setObraForm({
      nombre: obra.nombre || "",
      direccion: obra.direccion || "",
      estado: obra.estado || "en_curso",
      fecha_inicio: obra.fecha_inicio ? obra.fecha_inicio.slice(0, 10) : "",
      fecha_fin: obra.fecha_fin ? obra.fecha_fin.slice(0, 10) : "",
    });

    setEditandoObra(obra.id);
    setMostrarObraForm(true);
  };

  const guardarObra = async () => {
    setObraError(null);

    if (!obraForm.nombre) {
      setObraError("El nombre es obligatorio");
      return;
    }

    const payload = {
      ...obraForm,
      fecha_inicio: obraForm.fecha_inicio || null,
      fecha_fin: obraForm.fecha_fin || null,
    };

    try {
      const res = editandoObra
        ? await updateObra(editandoObra, payload)
        : await createObra(payload);

      if (res?.error) {
        setObraError(res.error);
        return;
      }

      setMostrarObraForm(false);
      setEditandoObra(null);
      await cargarObras();
    } catch (err) {
      console.error("Error guardando obra:", err);
    }
  };

  const eliminarObra = async (e, id) => {
    e.stopPropagation();

    if (!confirm("¿Eliminar obra?")) return;

    try {
      await deleteObra(id);

      if (obraAbierta === id) {
        setObraAbierta(null);
      }

      await cargarObras();
    } catch (err) {
      console.error("Error eliminando obra:", err);
    }
  };

  return (
    <div style={appShell}>
      {/* SIDEBAR */}
      <aside style={sidebar}>
        <div style={sidebarHeader}>
          <span style={brand}>🏗️ Gestor de Obras</span>

          <div style={{ marginTop: "8px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#888", fontSize: "12px" }}>
              {user?.nombre || user?.email}
            </span>

            <button onClick={onLogout} style={logoutBtn}>
              Salir
            </button>
          </div>
        </div>

        <div style={{ padding: "12px", borderBottom: "1px solid #222" }}>
          <input
            type="text"
            placeholder="Buscar obra..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={sideInput}
          />
        </div>

        <div style={sidebarObras}>
          <div style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between" }}>
            <span style={sideLabel}>Obras ({obrasFiltradas.length})</span>

            <button onClick={abrirNuevaObra} style={addObraBtn}>
              + Nueva
            </button>
          </div>

          {loadingObras ? (
            <SkeletonObraList count={4} />
          ) : (
            obrasFiltradas.map((o) => {
              const selected = obraAbierta === o.id;
              const ec = estadoColors[o.estado] || estadoColors.en_curso;

              return (
                <div
                  key={o.id}
                  onClick={() => toggleObra(o)}
                  style={{
                    ...obraItem,
                    background: selected ? "#1a2a1a" : "transparent",
                    borderLeft: `3px solid ${selected ? "#4ade80" : "transparent"}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span
                      style={{
                        color: selected ? "#fff" : "#b0b0b0",
                        fontWeight: selected ? "700" : "500",
                        fontSize: "13px",
                        flex: 1,
                      }}
                    >
                      {o.nombre}
                    </span>

                    <div style={{ display: "flex", gap: "4px" }}>
                      <button onClick={(e) => abrirEditarObra(e, o)} style={iconBtn}>
                        ✏️
                      </button>

                      <button
                        onClick={(e) => eliminarObra(e, o.id)}
                        style={{ ...iconBtn, color: "#ef4444" }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {o.direccion && (
                    <p style={{ color: "#666", fontSize: "11px", margin: "4px 0" }}>
                      {o.direccion}
                    </p>
                  )}

                  <span
                    style={{
                      ...estadoBadge,
                      background: ec.bg,
                      color: ec.color,
                    }}
                  >
                    {estadoLabel[o.estado]}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* MAIN */}
      <main style={mainContent}>
        {mostrarObraForm && (
          <div style={card}>
            <p style={formTitle}>
              {editandoObra ? "Editar obra" : "Nueva obra"}
            </p>

            <input
              placeholder="Nombre *"
              value={obraForm.nombre}
              onChange={(e) => setObraForm({ ...obraForm, nombre: e.target.value })}
              style={{ ...iS, width: "100%", marginBottom: "8px" }}
            />

            <input
              placeholder="Dirección"
              value={obraForm.direccion}
              onChange={(e) => setObraForm({ ...obraForm, direccion: e.target.value })}
              style={{ ...iS, width: "100%", marginBottom: "8px" }}
            />

            <select
              value={obraForm.estado}
              onChange={(e) => setObraForm({ ...obraForm, estado: e.target.value })}
              style={{ ...iS, width: "100%", marginBottom: "12px" }}
            >
              <option value="en_curso">En curso</option>
              <option value="pausada">Pausada</option>
              <option value="finalizada">Finalizada</option>
            </select>

            {obraError && <p style={errTxt}>{obraError}</p>}

            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={guardarObra} style={btnP}>
                {editandoObra ? "Guardar" : "Crear"}
              </button>

              <button onClick={() => setMostrarObraForm(false)} style={btnS}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {!obraAbierta && (
          <div style={emptyState}>
            <p style={{ color: "#555" }}>
              ← Seleccioná una obra para ver el dashboard
            </p>
          </div>
        )}

        {obraAbierta && (
  progreso[obraAbierta] ? (
    <>
      <div style={card}>
        <h2 style={{ color: "#fff" }}>
          {obras.find(o => o.id === obraAbierta)?.nombre}
        </h2>

        <ProgresoBar progreso={progreso[obraAbierta]} />

        <div style={{ marginTop: "16px" }}>
          <ExportButtons obraId={obraAbierta} />
        </div>
      </div>

      <div style={{ marginTop: "16px" }}>
        <ResumenDesvios obra={progreso[obraAbierta]} />
      </div>

      <div style={{ marginTop: "16px" }}>
        <FlujoPorMes data={flujoData[obraAbierta]} />
      </div>

      <div style={{ marginTop: "16px" }}>
        <AlertasVencimiento tasks={tasks[obraAbierta] || []} />
      </div>

      <div style={{ marginTop: "16px" }}>
        <Contactos obraId={obraAbierta} />
      </div>
    </>
  ) : (
    <div style={card}>
      <p style={{ color: "#888" }}>Cargando dashboard...</p>
    </div>
  )
)}


      </main>

      {/* PANEL DERECHO */}
      <aside style={rightPanel}>
        <p style={sectionTitle}>Dashboard</p>

        <div style={card}>
          <p style={{ color: "#888", fontSize: "12px" }}>
            Obras totales: {obras.length}
          </p>
        </div>
      </aside>
    </div>
  );
}

const appShell = {
  display: "grid",
  gridTemplateColumns: "240px 1fr 220px",
  minHeight: "100vh",
  background: "#0a0a0a",
};

const sidebar = {
  background: "#0f0f0f",
  borderRight: "1px solid #1e1e1e",
  display: "flex",
  flexDirection: "column",
};

const sidebarHeader = {
  padding: "14px",
  borderBottom: "1px solid #1e1e1e",
};

const brand = {
  color: "#e8e8e8",
  fontWeight: "700",
};

const logoutBtn = {
  background: "none",
  border: "1px solid #2a2a2a",
  borderRadius: "4px",
  color: "#777",
  cursor: "pointer",
  padding: "3px 8px",
};

const sidebarObras = {
  flex: 1,
  overflowY: "auto",
};

const sideInput = {
  width: "100%",
  padding: "8px",
  background: "#1a1a1a",
  border: "1px solid #333",
  color: "#fff",
  borderRadius: "6px",
};

const sideLabel = {
  color: "#777",
  fontSize: "11px",
};

const addObraBtn = {
  background: "#1a2a4a",
  border: "1px solid #2563eb",
  borderRadius: "4px",
  color: "#60a5fa",
  cursor: "pointer",
  padding: "4px 8px",
};

const obraItem = {
  padding: "12px",
  borderBottom: "1px solid #1a1a1a",
  cursor: "pointer",
};

const estadoBadge = {
  display: "inline-block",
  borderRadius: "4px",
  padding: "2px 6px",
  fontSize: "10px",
  fontWeight: "600",
};

const iconBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#777",
};

const mainContent = {
  padding: "24px",
};

const rightPanel = {
  background: "#0f0f0f",
  borderLeft: "1px solid #1e1e1e",
  padding: "16px",
};

const card = {
  background: "#141414",
  border: "1px solid #222",
  borderRadius: "8px",
  padding: "16px",
};

const emptyState = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "60vh",
};

const formTitle = {
  color: "#d0d0d0",
  marginBottom: "12px",
};

const iS = {
  background: "#1e1e1e",
  border: "1px solid #333",
  borderRadius: "4px",
  color: "#d0d0d0",
  padding: "8px",
};

const btnP = {
  background: "#2563eb",
  border: "none",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer",
  padding: "8px 16px",
};

const btnS = {
  background: "#1a1a1a",
  border: "1px solid #333",
  borderRadius: "6px",
  color: "#888",
  cursor: "pointer",
  padding: "8px 16px",
};

const errTxt = {
  color: "#ef4444",
  fontSize: "12px",
};

const sectionTitle = {
  color: "#c0c0c0",
  fontSize: "13px",
  fontWeight: "600",
};