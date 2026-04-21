import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:8000";

// ─── Design tokens ────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink:       #0a0b0d;
    --ink2:      #13151a;
    --ink3:      #1c1f27;
    --ink4:      #262a35;
    --line:      rgba(255,255,255,0.06);
    --line2:     rgba(255,255,255,0.11);
    --dust:      #4a4f62;
    --mist:      #7c8299;
    --fog:       #b0b5c8;
    --snow:      #e8eaf2;
    --arc:       #5b8dee;
    --arc-dim:   rgba(91,141,238,0.13);
    --arc-glow:  rgba(91,141,238,0.25);
    --sage:      #4ecba0;
    --sage-dim:  rgba(78,203,160,0.13);
    --amber:     #f0a84a;
    --amber-dim: rgba(240,168,74,0.13);
    --rose:      #e86d6d;
    --rose-dim:  rgba(232,109,109,0.13);
    --r:         8px;
    --r2:        14px;
    --display:   'Syne', sans-serif;
    --mono:      'JetBrains Mono', monospace;
  }

  html, body, #root { height: 100%; }

  body {
    font-family: var(--mono);
    background: var(--ink);
    color: var(--snow);
    font-size: 13px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--ink4); border-radius: 2px; }

  /* ── Role selector ── */
  .role-screen {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 48px;
    background:
      radial-gradient(ellipse 60% 40% at 30% 60%, rgba(91,141,238,0.07) 0%, transparent 70%),
      radial-gradient(ellipse 50% 50% at 80% 30%, rgba(78,203,160,0.05) 0%, transparent 70%),
      var(--ink);
  }

  .role-brand {
    text-align: center;
  }
  .role-brand .eyebrow {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--dust);
    margin-bottom: 10px;
  }
  .role-brand h1 {
    font-family: var(--display);
    font-size: clamp(32px, 5vw, 52px);
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--snow);
    line-height: 1.1;
  }
  .role-brand h1 span { color: var(--arc); }

  .role-cards {
    display: flex;
    gap: 16px;
  }

  .role-card {
    width: 220px;
    padding: 28px 24px;
    background: var(--ink2);
    border: 1px solid var(--line2);
    border-radius: var(--r2);
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .role-card::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.2s;
    border-radius: var(--r2);
  }
  .role-card.arq::before { background: radial-gradient(ellipse at 50% 0%, var(--arc-dim), transparent 70%); }
  .role-card.cap::before { background: radial-gradient(ellipse at 50% 0%, var(--sage-dim), transparent 70%); }
  .role-card:hover { border-color: var(--line2); transform: translateY(-3px); }
  .role-card:hover::before { opacity: 1; }
  .role-card:hover.arq { border-color: rgba(91,141,238,0.3); box-shadow: 0 12px 40px rgba(91,141,238,0.1); }
  .role-card:hover.cap { border-color: rgba(78,203,160,0.3); box-shadow: 0 12px 40px rgba(78,203,160,0.1); }

  .role-icon {
    width: 48px; height: 48px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    margin: 0 auto 14px;
  }
  .role-card.arq .role-icon { background: var(--arc-dim); }
  .role-card.cap .role-icon { background: var(--sage-dim); }

  .role-card h2 {
    font-family: var(--display);
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 6px;
  }
  .role-card p {
    font-size: 11px;
    color: var(--mist);
    line-height: 1.5;
  }

  /* ── App shell ── */
  .shell {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  /* ── Sidebar ── */
  .sidebar {
    width: 220px;
    flex-shrink: 0;
    background: var(--ink2);
    border-right: 1px solid var(--line);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .sidebar-top {
    padding: 20px 16px 18px;
    border-bottom: 1px solid var(--line);
  }
  .sidebar-role-tag {
    font-size: 9px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--dust);
    margin-bottom: 6px;
  }
  .sidebar-title {
    font-family: var(--display);
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--snow);
  }
  .sidebar-role-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 8px;
    padding: 3px 8px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.03em;
  }
  .badge-arq { background: var(--arc-dim); color: var(--arc); border: 1px solid rgba(91,141,238,0.2); }
  .badge-cap { background: var(--sage-dim); color: var(--sage); border: 1px solid rgba(78,203,160,0.2); }

  .sidebar-nav { padding: 12px 8px; flex: 1; }
  .nav-section-label {
    font-size: 9px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--dust);
    padding: 0 8px;
    margin: 12px 0 4px;
  }

  .nav-btn {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    padding: 8px 10px;
    border-radius: var(--r);
    border: none;
    background: none;
    color: var(--mist);
    font-family: var(--mono);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
    text-align: left;
  }
  .nav-btn:hover { background: var(--ink3); color: var(--fog); }
  .nav-btn.active { background: var(--arc-dim); color: var(--arc); }
  .nav-btn.active.cap-nav { background: var(--sage-dim); color: var(--sage); }
  .nav-icon { font-size: 13px; opacity: 0.8; flex-shrink: 0; width: 16px; text-align: center; }

  .sidebar-footer {
    padding: 14px 16px;
    border-top: 1px solid var(--line);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .api-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    color: var(--dust);
  }
  .api-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--amber);
    flex-shrink: 0;
  }
  .api-dot.ok { background: var(--sage); box-shadow: 0 0 6px rgba(78,203,160,0.5); }
  .api-dot.err { background: var(--rose); }

  .switch-btn {
    font-size: 10px;
    color: var(--dust);
    background: none;
    border: 1px solid var(--line2);
    border-radius: 4px;
    padding: 3px 7px;
    cursor: pointer;
    font-family: var(--mono);
    transition: all 0.15s;
  }
  .switch-btn:hover { color: var(--fog); border-color: var(--line2); background: var(--ink3); }

  /* ── Main ── */
  .main { flex: 1; overflow-y: auto; background: var(--ink); }
  .page { padding: 28px 32px; animation: pageIn 0.2s ease; }
  @keyframes pageIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  /* ── Page header ── */
  .ph { margin-bottom: 24px; }
  .ph-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
  .ph h1 { font-family: var(--display); font-size: 26px; font-weight: 800; letter-spacing: -0.03em; color: var(--snow); line-height: 1.1; }
  .ph p { font-size: 12px; color: var(--mist); margin-top: 4px; }

  /* ── Metrics ── */
  .metrics { display: grid; gap: 10px; margin-bottom: 20px; }
  .metrics-4 { grid-template-columns: repeat(4, 1fr); }
  .metrics-3 { grid-template-columns: repeat(3, 1fr); }
  .metrics-2 { grid-template-columns: repeat(2, 1fr); }

  .metric {
    background: var(--ink2);
    border: 1px solid var(--line);
    border-radius: var(--r2);
    padding: 16px 18px;
    position: relative;
    overflow: hidden;
  }
  .metric::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--line2), transparent);
  }
  .metric-label { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dust); margin-bottom: 8px; }
  .metric-val { font-family: var(--display); font-size: 30px; font-weight: 800; letter-spacing: -0.04em; line-height: 1; }
  .c-arc { color: var(--arc); }
  .c-sage { color: var(--sage); }
  .c-amber { color: var(--amber); }
  .c-rose { color: var(--rose); }
  .c-fog { color: var(--fog); }

  /* ── Card ── */
  .card {
    background: var(--ink2);
    border: 1px solid var(--line);
    border-radius: var(--r2);
    padding: 20px;
    margin-bottom: 14px;
  }
  .card-title {
    font-family: var(--display);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.01em;
    color: var(--fog);
    margin-bottom: 16px;
  }

  /* ── Table ── */
  .tbl-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  thead th {
    text-align: left;
    padding: 7px 10px;
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--dust);
    border-bottom: 1px solid var(--line);
  }
  td { padding: 11px 10px; border-bottom: 1px solid var(--line); vertical-align: middle; font-size: 12px; }
  tr:last-child td { border-bottom: none; }
  tbody tr { transition: background 0.1s; }
  tbody tr:hover td { background: rgba(255,255,255,0.02); }
  .td-dim { color: var(--mist); }
  .td-mono { font-family: var(--mono); font-size: 11px; color: var(--mist); }

  /* ── Badges ── */
  .badge {
    display: inline-flex; align-items: center;
    padding: 2px 8px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.04em;
    font-family: var(--mono);
    white-space: nowrap;
  }
  .b-planificada { background: var(--amber-dim); color: var(--amber); border: 1px solid rgba(240,168,74,0.2); }
  .b-en_curso    { background: var(--arc-dim);   color: var(--arc);   border: 1px solid rgba(91,141,238,0.2); }
  .b-terminada   { background: var(--sage-dim);  color: var(--sage);  border: 1px solid rgba(78,203,160,0.2); }
  .b-pendiente   { background: var(--amber-dim); color: var(--amber); border: 1px solid rgba(240,168,74,0.2); }
  .b-en_progreso { background: var(--arc-dim);   color: var(--arc);   border: 1px solid rgba(91,141,238,0.2); }
  .b-terminado   { background: var(--sage-dim);  color: var(--sage);  border: 1px solid rgba(78,203,160,0.2); }
  .b-alta        { background: var(--rose-dim);  color: var(--rose);  border: 1px solid rgba(232,109,109,0.2); }
  .b-media       { background: var(--amber-dim); color: var(--amber); border: 1px solid rgba(240,168,74,0.2); }
  .b-baja        { background: rgba(255,255,255,0.05); color: var(--mist); border: 1px solid var(--line2); }

  /* ── Progress ── */
  .prog-track { width: 100%; height: 4px; background: var(--ink4); border-radius: 2px; overflow: hidden; min-width: 80px; }
  .prog-fill { height: 100%; border-radius: 2px; background: var(--arc); transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }
  .prog-fill.green { background: var(--sage); }
  .prog-pct { font-family: var(--mono); font-size: 10px; color: var(--dust); margin-top: 3px; }
  .prog-big-track { width: 100%; height: 8px; background: var(--ink4); border-radius: 4px; overflow: hidden; margin-bottom: 8px; }
  .prog-big-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, var(--arc), var(--sage)); transition: width 0.7s cubic-bezier(0.4,0,0.2,1); }
  .prog-big-val { font-family: var(--display); font-size: 28px; font-weight: 800; letter-spacing: -0.04em; color: var(--sage); }

  /* ── Buttons ── */
  .btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 7px 14px;
    font-size: 12px; font-weight: 500;
    font-family: var(--mono);
    border-radius: var(--r);
    cursor: pointer;
    border: 1px solid var(--line2);
    background: var(--ink3);
    color: var(--fog);
    transition: all 0.15s;
    white-space: nowrap;
  }
  .btn:hover { background: var(--ink4); color: var(--snow); }
  .btn:active { transform: scale(0.97); }
  .btn-primary { background: var(--arc); color: #fff; border-color: var(--arc); }
  .btn-primary:hover { background: #4a7de0; border-color: #4a7de0; }
  .btn-cap { background: var(--sage); color: var(--ink); border-color: var(--sage); font-weight: 600; }
  .btn-cap:hover { background: #3db88e; }
  .btn-ghost { background: none; border-color: transparent; color: var(--mist); }
  .btn-ghost:hover { background: var(--ink3); color: var(--fog); border-color: var(--line2); }
  .btn-danger { background: none; border-color: transparent; color: var(--rose); }
  .btn-danger:hover { background: var(--rose-dim); border-color: rgba(232,109,109,0.2); }
  .btn-sm { padding: 4px 10px; font-size: 11px; }
  .btn-xs { padding: 3px 8px; font-size: 10px; }

  /* ── Forms ── */
  .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 12px; }
  .field label { display: block; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--dust); margin-bottom: 5px; }
  input, select, textarea {
    width: 100%;
    background: var(--ink3);
    border: 1px solid var(--line2);
    border-radius: var(--r);
    padding: 8px 11px;
    font-size: 12px;
    color: var(--snow);
    font-family: var(--mono);
    transition: border-color 0.15s, box-shadow 0.15s;
    outline: none;
  }
  input::placeholder, textarea::placeholder { color: var(--dust); }
  input:focus, select:focus, textarea:focus { border-color: var(--arc); box-shadow: 0 0 0 3px var(--arc-dim); }
  select option { background: var(--ink3); }
  textarea { resize: vertical; min-height: 70px; line-height: 1.5; }
  .form-actions { display: flex; gap: 8px; margin-top: 18px; }
  .span-2 { grid-column: span 2; }

  /* ── Back link ── */
  .back { display: inline-flex; align-items: center; gap: 6px; color: var(--mist); font-size: 12px; background: none; border: none; cursor: pointer; padding: 0; margin-bottom: 20px; transition: color 0.15s; font-family: var(--mono); }
  .back:hover { color: var(--fog); }

  /* ── Empty state ── */
  .empty { text-align: center; padding: 40px 20px; color: var(--dust); font-size: 12px; }

  /* ── Flash ── */
  #flash-container { position: fixed; top: 20px; right: 24px; z-index: 999; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
  .flash {
    background: var(--ink3);
    border: 1px solid var(--line2);
    border-radius: var(--r2);
    padding: 11px 16px;
    font-size: 12px;
    animation: flashIn 0.25s ease;
    max-width: 300px;
    pointer-events: all;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  }
  .flash.ok  { border-color: rgba(78,203,160,0.4);  color: var(--sage); }
  .flash.err { border-color: rgba(232,109,109,0.4); color: var(--rose); }
  @keyframes flashIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }

  /* ── Divider ── */
  .divider { height: 1px; background: var(--line); margin: 16px 0; }

  /* ── Capataz task card ── */
  .task-card {
    background: var(--ink3);
    border: 1px solid var(--line);
    border-radius: var(--r2);
    padding: 16px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 14px;
    transition: border-color 0.15s;
  }
  .task-card:hover { border-color: var(--line2); }
  .task-card-body { flex: 1; min-width: 0; }
  .task-card-title { font-family: var(--display); font-size: 14px; font-weight: 600; margin-bottom: 6px; letter-spacing: -0.01em; }
  .task-card-meta { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
  .task-prog-col { min-width: 100px; }

  /* ── Med history ── */
  .med-row { display: flex; align-items: center; gap: 12px; padding: 9px 0; border-bottom: 1px solid var(--line); font-size: 12px; }
  .med-row:last-child { border-bottom: none; }
  .med-qty { font-family: var(--mono); font-weight: 500; color: var(--sage); min-width: 64px; }
  .med-date { color: var(--dust); font-size: 10px; font-family: var(--mono); min-width: 80px; }
  .med-obs { color: var(--mist); font-size: 11px; flex: 1; }

  /* ── Info strip ── */
  .info-strip {
    background: var(--ink3);
    border: 1px solid var(--line);
    border-radius: var(--r);
    padding: 12px 14px;
    display: flex; gap: 24px; flex-wrap: wrap;
    margin-bottom: 14px;
  }
  .info-item label { display: block; font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dust); margin-bottom: 2px; }
  .info-item strong { color: var(--snow); font-weight: 500; font-family: var(--mono); font-size: 13px; }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .metrics-4 { grid-template-columns: repeat(2, 1fr); }
  }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (d) => (d ? d.slice(0, 10) : "—");

function Badge({ estado }) {
  const k = estado || "pendiente";
  return <span className={`badge b-${k}`}>{k.replace("_", " ")}</span>;
}
function PrioBadge({ p }) {
  const k = p || "media";
  return <span className={`badge b-${k}`}>{k}</span>;
}
function ProgBar({ pct, green }) {
  const w = Math.min(pct || 0, 100);
  return (
    <div>
      <div className="prog-track">
        <div className={`prog-fill${green ? " green" : ""}`} style={{ width: `${w}%` }} />
      </div>
      <div className="prog-pct">{(pct || 0).toFixed(1)}%</div>
    </div>
  );
}

// ─── Flash ───────────────────────────────────────────────────────────────────
let _flashId = 0;
let _setFlashes = null;
function flash(msg, type = "ok") {
  const id = ++_flashId;
  _setFlashes?.((prev) => [...prev, { id, msg, type }]);
  setTimeout(() => _setFlashes?.((prev) => prev.filter((f) => f.id !== id)), 3000);
}

function FlashContainer() {
  const [flashes, setFlashes] = useState([]);
  _setFlashes = setFlashes;
  return (
    <div id="flash-container">
      {flashes.map((f) => (
        <div key={f.id} className={`flash ${f.type}`}>{f.msg}</div>
      ))}
    </div>
  );
}

// ─── API calls ───────────────────────────────────────────────────────────────
const api = {
  get: (path) => fetch(API + path).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }),
  post: (path, body) => fetch(API + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
  put:  (path, body) => fetch(API + path, { method: "PUT",  headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
  del:  (path) => fetch(API + path, { method: "DELETE" }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// ARQUITECTO VIEWS
// ═══════════════════════════════════════════════════════════════════════════════

function ObrasPage({ onDetalle }) {
  const [obras, setObras] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/obras" + (filter ? `?estado=${filter}` : ""));
      setObras(data);
    } catch { flash("Error al cargar obras", "err"); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const del = async (id, nombre) => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    const r = await api.del(`/api/obras/${id}`);
    if (r.ok) { flash("Obra eliminada"); load(); }
    else flash("Error al eliminar", "err");
  };

  const total = obras.length;
  const en_curso = obras.filter((o) => o.estado === "en_curso").length;
  const plan = obras.filter((o) => o.estado === "planificada").length;
  const term = obras.filter((o) => o.estado === "terminada").length;

  return (
    <div className="page">
      <div className="ph-row">
        <div className="ph">
          <h1>Obras</h1>
          <p>Panel de gestión del estudio</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 160 }}>
            <option value="">Todos los estados</option>
            <option value="planificada">Planificada</option>
            <option value="en_curso">En curso</option>
            <option value="terminada">Terminada</option>
          </select>
        </div>
      </div>

      <div className="metrics metrics-4">
        <div className="metric"><div className="metric-label">Total</div><div className="metric-val c-arc">{total}</div></div>
        <div className="metric"><div className="metric-label">En curso</div><div className="metric-val c-arc">{en_curso}</div></div>
        <div className="metric"><div className="metric-label">Planificadas</div><div className="metric-val c-amber">{plan}</div></div>
        <div className="metric"><div className="metric-label">Terminadas</div><div className="metric-val c-sage">{term}</div></div>
      </div>

      <div className="card">
        <div className="tbl-wrap">
          {loading ? <p className="empty">Cargando…</p> : !obras.length ? <p className="empty">No hay obras registradas</p> : (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th><th>Dirección</th><th>Estado</th><th>Inicio</th><th>Progreso</th><th></th>
                </tr>
              </thead>
              <tbody>
                {obras.map((o) => (
                  <tr key={o.id}>
                    <td><strong style={{ fontFamily: "var(--display)", fontSize: 13 }}>{o.nombre}</strong></td>
                    <td className="td-dim">{o.direccion || "—"}</td>
                    <td><Badge estado={o.estado} /></td>
                    <td className="td-mono">{fmt(o.fecha_inicio)}</td>
                    <td style={{ minWidth: 120 }}><ProgBar pct={o.progreso} green={o.estado === "terminada"} /></td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn btn-sm" onClick={() => onDetalle(o.id)}>Ver</button>
                        <button className="btn btn-sm btn-danger" onClick={() => del(o.id, o.nombre)}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function NuevaObraPage({ onBack }) {
  const [form, setForm] = useState({ nombre: "", direccion: "", estado: "planificada", fecha_inicio: "", fecha_fin: "" });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.nombre.trim()) { flash("Falta el nombre", "err"); return; }
    const body = { ...form, fecha_inicio: form.fecha_inicio || null, fecha_fin: form.fecha_fin || null };
    const r = await api.post("/api/obras", body);
    if (r.ok) { flash("Obra creada ✓"); onBack(); }
    else { const d = await r.json(); flash(d.message || "Error", "err"); }
  };

  return (
    <div className="page">
      <button className="back" onClick={onBack}>← Volver</button>
      <div className="ph"><h1>Nueva obra</h1><p>Registrar un proyecto nuevo</p></div>
      <div className="card" style={{ maxWidth: 620 }}>
        <div className="form-grid">
          <div className="field span-2"><label>Nombre *</label><input placeholder="Ej: Vivienda Unifamiliar Lugano" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} /></div>
          <div className="field span-2"><label>Dirección</label><input placeholder="Ej: Av. Corrientes 1234, CABA" value={form.direccion} onChange={(e) => set("direccion", e.target.value)} /></div>
          <div className="field"><label>Estado</label>
            <select value={form.estado} onChange={(e) => set("estado", e.target.value)}>
              <option value="planificada">Planificada</option>
              <option value="en_curso">En curso</option>
              <option value="terminada">Terminada</option>
            </select>
          </div>
          <div className="field"><label>Fecha inicio</label><input type="date" value={form.fecha_inicio} onChange={(e) => set("fecha_inicio", e.target.value)} /></div>
          <div className="field"><label>Fecha fin prevista</label><input type="date" value={form.fecha_fin} onChange={(e) => set("fecha_fin", e.target.value)} /></div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={submit}>Crear obra</button>
          <button className="btn btn-ghost" onClick={onBack}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

function DetalleObraPage({ obraId, onBack, onNuevaTarea }) {
  const [obra, setObra] = useState(null);
  const [prog, setProg] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [obraData, progData] = await Promise.all([
        api.get(`/api/obras/${obraId}`),
        api.get(`/api/obras/${obraId}/progreso`),
      ]);
      setObra(obraData);
      setProg(progData.progreso || 0);
    } catch { flash("Error al cargar obra", "err"); }
    finally { setLoading(false); }
  }, [obraId]);

  useEffect(() => { load(); }, [load]);

  const delTarea = async (id) => {
    if (!confirm("¿Eliminar esta tarea?")) return;
    const r = await api.del(`/api/tasks/${id}`);
    if (r.ok) { flash("Tarea eliminada"); load(); }
    else flash("Error", "err");
  };

  if (loading) return <div className="page"><p className="empty">Cargando…</p></div>;
  if (!obra) return <div className="page"><p className="empty" style={{ color: "var(--rose)" }}>No se pudo cargar la obra</p></div>;

  const tasks = obra.tasks || [];

  return (
    <div className="page">
      <button className="back" onClick={onBack}>← Volver a obras</button>

      <div className="ph-row">
        <div>
          <h1>{obra.nombre}</h1>
          <p style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
            <span style={{ color: "var(--mist)" }}>{obra.direccion || "Sin dirección"}</span>
            <Badge estado={obra.estado} />
            <span className="td-mono">{fmt(obra.fecha_inicio)} → {fmt(obra.fecha_fin)}</span>
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => onNuevaTarea(obra.id, obra.nombre)}>+ Nueva tarea</button>
      </div>

      <div className="metrics metrics-3">
        <div className="metric"><div className="metric-label">Total tareas</div><div className="metric-val c-arc">{tasks.length}</div></div>
        <div className="metric"><div className="metric-label">En progreso</div><div className="metric-val c-arc">{tasks.filter((t) => t.estado === "en_progreso").length}</div></div>
        <div className="metric"><div className="metric-label">Terminadas</div><div className="metric-val c-sage">{tasks.filter((t) => t.estado === "terminado").length}</div></div>
      </div>

      <div className="card">
        <div className="card-title">Avance real por mediciones</div>
        <div className="prog-big-track">
          <div className="prog-big-fill" style={{ width: `${Math.min(prog, 100)}%` }} />
        </div>
        <div className="prog-big-val">{prog.toFixed(1)}%</div>
      </div>

      <div className="card">
        <div className="card-title">Tareas</div>
        {!tasks.length ? (
          <p className="empty">Sin tareas. Usá el botón de arriba para agregar la primera.</p>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr><th>Tarea</th><th>Responsable</th><th>Unidad</th><th>Estado</th><th>Prioridad</th><th>Fin</th><th></th></tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id}>
                    <td><strong style={{ fontFamily: "var(--display)", fontSize: 13 }}>{t.titulo}</strong></td>
                    <td className="td-dim">{t.responsable || "—"}</td>
                    <td className="td-mono">{t.unidad || "—"}</td>
                    <td><Badge estado={t.estado} /></td>
                    <td><PrioBadge p={t.prioridad} /></td>
                    <td className="td-mono">{fmt(t.fecha_fin)}</td>
                    <td><button className="btn btn-xs btn-danger" onClick={() => delTarea(t.id)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function NuevaTareaPage({ obraId, obraNombre, onBack }) {
  const [form, setForm] = useState({ titulo: "", responsable: "", estado: "pendiente", unidad: "", cantidad_total: "", prioridad: "media", fecha_inicio: "", fecha_fin: "" });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.titulo.trim()) { flash("Falta el título", "err"); return; }
    if (!form.unidad.trim()) { flash("Falta la unidad", "err"); return; }
    const body = { ...form, obraId, cantidad_total: Number(form.cantidad_total) || 0, fecha_inicio: form.fecha_inicio || null, fecha_fin: form.fecha_fin || null };
    const r = await api.post("/api/tasks", body);
    if (r.ok) { flash("Tarea creada ✓"); onBack(); }
    else { const d = await r.json(); flash(d.message || "Error", "err"); }
  };

  return (
    <div className="page">
      <button className="back" onClick={onBack}>← Volver a la obra</button>
      <div className="ph">
        <h1>Nueva tarea</h1>
        <p style={{ color: "var(--arc)" }}>{obraNombre}</p>
      </div>
      <div className="card" style={{ maxWidth: 620 }}>
        <div className="form-grid">
          <div className="field span-2"><label>Título *</label><input placeholder="Ej: Replanteo planta baja" value={form.titulo} onChange={(e) => set("titulo", e.target.value)} /></div>
          <div className="field"><label>Responsable</label><input placeholder="Nombre del capataz" value={form.responsable} onChange={(e) => set("responsable", e.target.value)} /></div>
          <div className="field"><label>Estado</label>
            <select value={form.estado} onChange={(e) => set("estado", e.target.value)}>
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En progreso</option>
              <option value="terminado">Terminado</option>
            </select>
          </div>
          <div className="field"><label>Unidad *</label><input placeholder="m², ml, kg, unid…" value={form.unidad} onChange={(e) => set("unidad", e.target.value)} /></div>
          <div className="field"><label>Cantidad total</label><input type="number" placeholder="100" min="0" value={form.cantidad_total} onChange={(e) => set("cantidad_total", e.target.value)} /></div>
          <div className="field"><label>Prioridad</label>
            <select value={form.prioridad} onChange={(e) => set("prioridad", e.target.value)}>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
          <div className="field"><label>Fecha inicio</label><input type="date" value={form.fecha_inicio} onChange={(e) => set("fecha_inicio", e.target.value)} /></div>
          <div className="field"><label>Fecha fin</label><input type="date" value={form.fecha_fin} onChange={(e) => set("fecha_fin", e.target.value)} /></div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={submit}>Crear tarea</button>
          <button className="btn btn-ghost" onClick={onBack}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CAPATAZ VIEWS
// ═══════════════════════════════════════════════════════════════════════════════

function CapDashboard() {
  const [obras, setObras] = useState([]);
  const [obraId, setObraId] = useState("");
  const [data, setData] = useState(null);
  const [prog, setProg] = useState(0);

  useEffect(() => {
    api.get("/api/obras").then(setObras).catch(() => {});
  }, []);

  useEffect(() => {
    if (!obraId) { setData(null); return; }
    Promise.all([
      api.get(`/api/obras/${obraId}`),
      api.get(`/api/obras/${obraId}/progreso`),
    ]).then(([o, p]) => { setData(o); setProg(p.progreso || 0); }).catch(() => flash("Error al cargar", "err"));
  }, [obraId]);

  const tasks = data?.tasks || [];

  return (
    <div className="page">
      <div className="ph"><h1>Mi obra del día</h1><p>Vista de campo — avance y tareas asignadas</p></div>

      <div className="card" style={{ maxWidth: 380, marginBottom: 20 }}>
        <div className="field"><label>Seleccionar obra</label>
          <select value={obraId} onChange={(e) => setObraId(e.target.value)}>
            <option value="">— elegir obra —</option>
            {obras.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
          </select>
        </div>
      </div>

      {data && (
        <>
          <div className="metrics metrics-3">
            <div className="metric"><div className="metric-label">Avance real</div><div className="metric-val c-sage">{prog.toFixed(1)}%</div></div>
            <div className="metric"><div className="metric-label">En progreso</div><div className="metric-val c-arc">{tasks.filter((t) => t.estado === "en_progreso").length}</div></div>
            <div className="metric"><div className="metric-label">Pendientes</div><div className="metric-val c-amber">{tasks.filter((t) => t.estado === "pendiente").length}</div></div>
          </div>

          <div className="card">
            <div className="card-title">Avance por mediciones</div>
            <div className="prog-big-track"><div className="prog-big-fill" style={{ width: `${Math.min(prog, 100)}%` }} /></div>
            <div className="prog-big-val">{prog.toFixed(1)}%</div>
          </div>

          <div className="card">
            <div className="card-title">Tareas asignadas</div>
            {!tasks.length ? <p className="empty">Sin tareas asignadas</p> : tasks.map((t) => (
              <div className="task-card" key={t.id}>
                <div className="task-card-body">
                  <div className="task-card-title">{t.titulo}</div>
                  <div className="task-card-meta">
                    <Badge estado={t.estado} />
                    <PrioBadge p={t.prioridad} />
                    {t.responsable && <span className="td-mono" style={{ fontSize: 10 }}>{t.responsable}</span>}
                    <span className="td-mono" style={{ fontSize: 10, color: "var(--dust)" }}>Fin: {fmt(t.fecha_fin)}</span>
                  </div>
                </div>
                <div className="task-prog-col">
                  <div className="prog-track"><div className="prog-fill" style={{ width: 0 }} /></div>
                  <div className="prog-pct">{t.unidad || ""}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CapMedicion() {
  const [obras, setObras] = useState([]);
  const [obraId, setObraId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [taskId, setTaskId] = useState("");
  const [taskInfo, setTaskInfo] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cantidad, setCantidad] = useState("");
  const [obs, setObs] = useState("");

  useEffect(() => { api.get("/api/obras").then(setObras).catch(() => {}); }, []);

  const loadTasks = async (oid) => {
    setObraId(oid); setTaskId(""); setTaskInfo(null); setHistorial([]); setTasks([]);
    if (!oid) return;
    try { setTasks(await api.get(`/api/obras/${oid}/tasks`)); }
    catch { flash("Error al cargar tareas", "err"); }
  };

  const loadTask = async (tid) => {
    setTaskId(tid); setTaskInfo(null); setHistorial([]);
    if (!tid) return;
    try {
      const [info, meds] = await Promise.all([
        api.get(`/api/tasks/${tid}/progreso`),
        api.get(`/api/tasks/${tid}/mediciones`),
      ]);
      setTaskInfo(info);
      setHistorial(meds);
    } catch { flash("Error al cargar tarea", "err"); }
  };

  const enviar = async () => {
    if (!taskId) { flash("Seleccioná una tarea", "err"); return; }
    if (cantidad === "") { flash("Ingresá una cantidad", "err"); return; }
    if (Number(cantidad) < 0) { flash("La cantidad no puede ser negativa", "err"); return; }
    const r = await api.post(`/api/tasks/${taskId}/mediciones`, { cantidad: Number(cantidad), observaciones: obs });
    if (r.ok) { flash("Medición registrada ✓"); setCantidad(""); setObs(""); loadTask(taskId); }
    else { const d = await r.json(); flash(d.message || "Error", "err"); }
  };

  const unidad = taskInfo?.unidad || tasks.find((t) => t.id == taskId)?.unidad || "—";

  return (
    <div className="page">
      <div className="ph"><h1>Cargar medición</h1><p>Registrar avance de una tarea desde la obra</p></div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignItems: "start" }}>
        <div>
          <div className="card">
            <div className="card-title">Selección</div>
            <div className="field" style={{ marginBottom: 12 }}>
              <label>Obra</label>
              <select value={obraId} onChange={(e) => loadTasks(e.target.value)}>
                <option value="">— elegir obra —</option>
                {obras.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Tarea</label>
              <select value={taskId} onChange={(e) => loadTask(e.target.value)} disabled={!tasks.length}>
                <option value="">— elegir tarea —</option>
                {tasks.map((t) => <option key={t.id} value={t.id}>{t.titulo}</option>)}
              </select>
            </div>
          </div>

          {taskInfo && (
            <div className="card">
              <div className="card-title">Nueva medición</div>
              <div className="info-strip">
                <div className="info-item"><label>Unidad</label><strong>{unidad}</strong></div>
                <div className="info-item"><label>Ejecutado</label><strong>{taskInfo.ejecutado || 0} {unidad}</strong></div>
                <div className="info-item"><label>Total</label><strong>{taskInfo.cantidad_total || "—"} {unidad}</strong></div>
                <div className="info-item"><label>Avance</label><strong style={{ color: "var(--sage)" }}>{(taskInfo.progreso || 0).toFixed(1)}%</strong></div>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label>Cantidad *</label>
                  <input type="number" placeholder="0" min="0" step="0.01" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
                </div>
                <div className="field">
                  <label>Observaciones</label>
                  <input placeholder="Opcional" value={obs} onChange={(e) => setObs(e.target.value)} />
                </div>
              </div>
              <div className="form-actions">
                <button className="btn btn-cap" onClick={enviar}>Registrar avance</button>
              </div>
            </div>
          )}
        </div>

        <div className="card" style={{ minHeight: 200 }}>
          <div className="card-title">Historial de mediciones</div>
          {!taskId ? (
            <p className="empty">Seleccioná una tarea</p>
          ) : !historial.length ? (
            <p className="empty">Sin mediciones aún</p>
          ) : (
            historial.map((m) => (
              <div className="med-row" key={m.id}>
                <span className="med-date">{fmt(m.fecha)}</span>
                <span className="med-qty">+{m.cantidad} {unidad}</span>
                <span className="med-obs">{m.observaciones || ""}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROLE SELECTOR
// ═══════════════════════════════════════════════════════════════════════════════

function RoleSelector({ onSelect }) {
  return (
    <div className="role-screen">
      <div className="role-brand">
        <div className="eyebrow">AEC · Portfolio</div>
        <h1>Gestor de <span>Obras</span></h1>
      </div>
      <div className="role-cards">
        <div className="role-card arq" onClick={() => onSelect("arq")}>
          <div className="role-icon">🏛</div>
          <h2>Arquitecto</h2>
          <p>Gestión completa de obras, tareas, progreso y documentación</p>
        </div>
        <div className="role-card cap" onClick={() => onSelect("cap")}>
          <div className="role-icon">🦺</div>
          <h2>Capataz</h2>
          <p>Vista de campo: tareas asignadas y carga de mediciones</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHELLS
// ═══════════════════════════════════════════════════════════════════════════════

function ArqShell({ onSwitch }) {
  const [page, setPage] = useState("obras");
  const [detalleId, setDetalleId] = useState(null);
  const [nuevaTareaObra, setNuevaTareaObra] = useState(null);
  const [apiOk, setApiOk] = useState(null);

  useEffect(() => {
    api.get("/api/obras").then(() => setApiOk(true)).catch(() => setApiOk(false));
  }, []);

  const navItems = [
    { id: "obras", icon: "▦", label: "Obras" },
    { id: "nueva-obra", icon: "+", label: "Nueva obra" },
  ];

  const renderPage = () => {
    if (page === "detalle" && detalleId) return (
      <DetalleObraPage
        obraId={detalleId}
        onBack={() => setPage("obras")}
        onNuevaTarea={(id, nombre) => { setNuevaTareaObra({ id, nombre }); setPage("nueva-tarea"); }}
      />
    );
    if (page === "nueva-tarea" && nuevaTareaObra) return (
      <NuevaTareaPage
        obraId={nuevaTareaObra.id}
        obraNombre={nuevaTareaObra.nombre}
        onBack={() => { setPage("detalle"); }}
      />
    );
    if (page === "nueva-obra") return <NuevaObraPage onBack={() => setPage("obras")} />;
    return <ObrasPage onDetalle={(id) => { setDetalleId(id); setPage("detalle"); }} />;
  };

  return (
    <div className="shell">
      <nav className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-role-tag">AEC · Portfolio</div>
          <div className="sidebar-title">Gestor de Obras</div>
          <div className="sidebar-role-badge badge-arq">🏛 Arquitecto</div>
        </div>
        <div className="sidebar-nav">
          <div className="nav-section-label">Estudio</div>
          {navItems.map((item) => (
            <button key={item.id} className={`nav-btn${page === item.id ? " active" : ""}`} onClick={() => setPage(item.id)}>
              <span className="nav-icon">{item.icon}</span>{item.label}
            </button>
          ))}
        </div>
        <div className="sidebar-footer">
          <div className="api-indicator">
            <span className={`api-dot${apiOk === true ? " ok" : apiOk === false ? " err" : ""}`} />
            <span>{apiOk === true ? "API ok" : apiOk === false ? "sin conexión" : "…"}</span>
          </div>
          <button className="switch-btn" onClick={onSwitch}>cambiar rol</button>
        </div>
      </nav>
      <main className="main">{renderPage()}</main>
    </div>
  );
}

function CapShell({ onSwitch }) {
  const [page, setPage] = useState("dashboard");
  const [apiOk, setApiOk] = useState(null);

  useEffect(() => {
    api.get("/api/obras").then(() => setApiOk(true)).catch(() => setApiOk(false));
  }, []);

  const navItems = [
    { id: "dashboard", icon: "◈", label: "Mi obra del día" },
    { id: "medicion", icon: "◎", label: "Cargar medición" },
  ];

  return (
    <div className="shell">
      <nav className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-role-tag">AEC · Campo</div>
          <div className="sidebar-title">Gestor de Obras</div>
          <div className="sidebar-role-badge badge-cap">🦺 Capataz</div>
        </div>
        <div className="sidebar-nav">
          <div className="nav-section-label">Campo</div>
          {navItems.map((item) => (
            <button key={item.id} className={`nav-btn${page === item.id ? " active cap-nav" : ""}`} onClick={() => setPage(item.id)}>
              <span className="nav-icon">{item.icon}</span>{item.label}
            </button>
          ))}
        </div>
        <div className="sidebar-footer">
          <div className="api-indicator">
            <span className={`api-dot${apiOk === true ? " ok" : apiOk === false ? " err" : ""}`} />
            <span>{apiOk === true ? "API ok" : apiOk === false ? "sin conexión" : "…"}</span>
          </div>
          <button className="switch-btn" onClick={onSwitch}>cambiar rol</button>
        </div>
      </nav>
      <main className="main">
        {page === "dashboard" && <CapDashboard />}
        {page === "medicion" && <CapMedicion />}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [role, setRole] = useState(null);

  return (
    <>
      <style>{css}</style>
      <FlashContainer />
      {!role && <RoleSelector onSelect={setRole} />}
      {role === "arq" && <ArqShell onSwitch={() => setRole(null)} />}
      {role === "cap" && <CapShell onSwitch={() => setRole(null)} />}
    </>
  );
}