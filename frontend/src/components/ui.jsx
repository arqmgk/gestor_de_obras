import { useState, useEffect, createContext, useContext } from 'react';

// ─── Flash system ────────────────────────────────────────────────────────────
const FlashContext = createContext(null);
let _flashDispatch = null;

export function FlashProvider({ children }) {
  const [flashes, setFlashes] = useState([]);
  _flashDispatch = setFlashes;
  return (
    <FlashContext.Provider value={setFlashes}>
      {children}
      <div id="flash-root">
        {flashes.map(f => (
          <div key={f.id} className={`flash ${f.type}`}>{f.msg}</div>
        ))}
      </div>
    </FlashContext.Provider>
  );
}

let _id = 0;
export function flash(msg, type = 'ok') {
  const id = ++_id;
  _flashDispatch?.(prev => [...prev, { id, msg, type }]);
  setTimeout(() => _flashDispatch?.(prev => prev.filter(f => f.id !== id)), 3200);
}

// ─── Badge ───────────────────────────────────────────────────────────────────
const BADGE_MAP = {
  planificada: 'amber', en_curso: 'arc', terminada: 'sage',
  pendiente: 'amber',   en_progreso: 'arc', terminado: 'sage',
  alta: 'rose', media: 'amber', baja: 'muted',
};

export function Badge({ value }) {
  const k = value || 'pendiente';
  const color = BADGE_MAP[k] || 'muted';
  return <span className={`badge badge-${color}`}>{k.replace('_', ' ')}</span>;
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
export function ProgBar({ pct, size = 'sm', green }) {
  const w = Math.min(Number(pct) || 0, 100);
  if (size === 'lg') return (
    <div>
      <div className="prog-lg-track">
        <div className="prog-lg-fill" style={{ width: `${w}%` }} />
      </div>
      <div className="prog-lg-val">{w.toFixed(1)}%</div>
    </div>
  );
  return (
    <div>
      <div className="prog-track">
        <div className={`prog-fill ${green ? 'green' : ''}`} style={{ width: `${w}%` }} />
      </div>
      <div className="prog-pct">{w.toFixed(1)}%</div>
    </div>
  );
}

// ─── Metric card ─────────────────────────────────────────────────────────────
export function Metric({ label, value, color = 'arc' }) {
  return (
    <div className="metric">
      <div className="metric-label">{label}</div>
      <div className={`metric-val c-${color}`}>{value}</div>
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────
export function Card({ title, children, style }) {
  return (
    <div className="card" style={style}>
      {title && <div className="card-title">{title}</div>}
      {children}
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
export function Empty({ msg = 'Sin datos' }) {
  return <p className="empty">{msg}</p>;
}

// ─── Back button ─────────────────────────────────────────────────────────────
export function BackBtn({ onClick, label = '← Volver' }) {
  return <button className="back-btn" onClick={onClick}>{label}</button>;
}

// ─── API status dot ──────────────────────────────────────────────────────────
export function ApiDot() {
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    fetch('http://localhost:8000/api/obras')
      .then(r => setStatus(r.ok ? 'ok' : 'err'))
      .catch(() => setStatus('err'));
  }, []);
  const label = { loading: '…', ok: 'API ok', err: 'sin conexión' }[status];
  return (
    <div className="api-indicator">
      <span className={`api-dot ${status}`} />
      <span>{label}</span>
    </div>
  );
}

// ─── Shared CSS injected once ─────────────────────────────────────────────────
export const sharedCSS = `
  /* ── Badges ── */
  .badge {
    display: inline-flex; align-items: center;
    padding: 2px 9px; border-radius: 20px;
    font-size: 10px; font-weight: 500;
    letter-spacing: 0.04em;
    font-family: var(--mono);
    white-space: nowrap;
  }
  .badge-arc    { background:var(--arc-dim);   color:var(--arc);   border:1px solid var(--arc-border);   }
  .badge-sage   { background:var(--sage-dim);  color:var(--sage);  border:1px solid var(--sage-border);  }
  .badge-amber  { background:var(--amber-dim); color:var(--amber); border:1px solid var(--amber-border); }
  .badge-rose   { background:var(--rose-dim);  color:var(--rose);  border:1px solid var(--rose-border);  }
  .badge-muted  { background:rgba(255,255,255,0.05); color:var(--mist); border:1px solid var(--line2); }

  /* ── Progress sm ── */
  .prog-track  { width:100%; height:4px; background:var(--ink5); border-radius:2px; overflow:hidden; min-width:80px; }
  .prog-fill   { height:100%; border-radius:2px; background:var(--arc); transition:width 0.6s cubic-bezier(.4,0,.2,1); }
  .prog-fill.green { background:var(--sage); }
  .prog-pct    { font-family:var(--mono); font-size:10px; color:var(--dust); margin-top:3px; }

  /* ── Progress lg ── */
  .prog-lg-track { width:100%; height:8px; background:var(--ink5); border-radius:4px; overflow:hidden; margin-bottom:8px; }
  .prog-lg-fill  { height:100%; border-radius:4px; background:linear-gradient(90deg,var(--arc),var(--sage)); transition:width 0.7s cubic-bezier(.4,0,.2,1); }
  .prog-lg-val   { font-family:var(--display); font-size:30px; font-weight:800; letter-spacing:-0.04em; color:var(--sage); }

  /* ── Metric ── */
  .metric { background:var(--ink2); border:1px solid var(--line); border-radius:var(--r2); padding:16px 18px; position:relative; overflow:hidden; }
  .metric::after { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,var(--line2),transparent); }
  .metric-label { font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--dust); margin-bottom:8px; }
  .metric-val   { font-family:var(--display); font-size:30px; font-weight:800; letter-spacing:-0.04em; line-height:1; }
  .c-arc   { color:var(--arc); }
  .c-sage  { color:var(--sage); }
  .c-amber { color:var(--amber); }
  .c-rose  { color:var(--rose); }
  .c-fog   { color:var(--fog); }

  /* ── Card ── */
  .card { background:var(--ink2); border:1px solid var(--line); border-radius:var(--r2); padding:20px; margin-bottom:14px; }
  .card-title { font-family:var(--display); font-size:13px; font-weight:600; letter-spacing:0.01em; color:var(--fog); margin-bottom:16px; }

  /* ── Table ── */
  .tbl-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; }
  thead th { text-align:left; padding:7px 10px; font-size:9px; font-weight:500; letter-spacing:0.15em; text-transform:uppercase; color:var(--dust); border-bottom:1px solid var(--line); }
  td { padding:11px 10px; border-bottom:1px solid var(--line); vertical-align:middle; font-size:12px; }
  tr:last-child td { border-bottom:none; }
  tbody tr { transition:background 0.1s; }
  tbody tr:hover td { background:rgba(255,255,255,0.018); }
  .td-dim  { color:var(--mist); }
  .td-mono { font-family:var(--mono); font-size:11px; color:var(--mist); }

  /* ── Buttons ── */
  .btn {
    display:inline-flex; align-items:center; gap:5px;
    padding:7px 14px; font-size:12px; font-weight:500;
    font-family:var(--mono); border-radius:var(--r);
    cursor:pointer; border:1px solid var(--line2);
    background:var(--ink3); color:var(--fog);
    transition:all 0.15s; white-space:nowrap;
  }
  .btn:hover  { background:var(--ink4); color:var(--snow); border-color:var(--line3); }
  .btn:active { transform:scale(0.97); }
  .btn-primary { background:var(--arc); color:#fff; border-color:var(--arc); }
  .btn-primary:hover { background:#4a7de0; border-color:#4a7de0; }
  .btn-sage    { background:var(--sage); color:var(--ink); border-color:var(--sage); font-weight:600; }
  .btn-sage:hover { background:#3db88e; }
  .btn-ghost   { background:none; border-color:transparent; color:var(--mist); }
  .btn-ghost:hover { background:var(--ink3); color:var(--fog); border-color:var(--line2); }
  .btn-danger  { background:none; border-color:transparent; color:var(--rose); }
  .btn-danger:hover { background:var(--rose-dim); border-color:var(--rose-border); }
  .btn-sm  { padding:4px 10px; font-size:11px; }
  .btn-xs  { padding:3px 8px;  font-size:10px; }

  /* ── Form ── */
  .form-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; margin-bottom:12px; }
  .field label { display:block; font-size:9px; letter-spacing:0.12em; text-transform:uppercase; color:var(--dust); margin-bottom:5px; }
  input, select, textarea {
    width:100%; background:var(--ink3); border:1px solid var(--line2);
    border-radius:var(--r); padding:8px 11px; font-size:12px;
    color:var(--snow); font-family:var(--mono);
    transition:border-color 0.15s, box-shadow 0.15s; outline:none;
  }
  input::placeholder, textarea::placeholder { color:var(--dust); }
  input:focus, select:focus, textarea:focus { border-color:var(--arc); box-shadow:0 0 0 3px var(--arc-dim); }
  select option { background:var(--ink3); }
  textarea { resize:vertical; min-height:70px; line-height:1.5; }
  .form-actions { display:flex; gap:8px; margin-top:18px; }
  .span-2 { grid-column:span 2; }

  /* ── Misc ── */
  .empty    { text-align:center; padding:40px 20px; color:var(--dust); font-size:12px; }
  .back-btn { display:inline-flex; align-items:center; gap:6px; color:var(--mist); font-size:12px; background:none; border:none; cursor:pointer; padding:0; margin-bottom:20px; transition:color 0.15s; font-family:var(--mono); }
  .back-btn:hover { color:var(--fog); }
  .divider  { height:1px; background:var(--line); margin:16px 0; }

  /* ── Info strip ── */
  .info-strip { background:var(--ink3); border:1px solid var(--line); border-radius:var(--r); padding:12px 14px; display:flex; gap:24px; flex-wrap:wrap; margin-bottom:14px; }
  .info-strip .info-item label { display:block; font-size:9px; letter-spacing:0.1em; text-transform:uppercase; color:var(--dust); margin-bottom:2px; }
  .info-strip .info-item strong { color:var(--snow); font-weight:500; font-family:var(--mono); font-size:13px; }

  /* ── Med history ── */
  .med-row { display:flex; align-items:center; gap:12px; padding:9px 0; border-bottom:1px solid var(--line); font-size:12px; }
  .med-row:last-child { border-bottom:none; }
  .med-qty  { font-family:var(--mono); font-weight:500; color:var(--sage); min-width:80px; }
  .med-date { color:var(--dust); font-size:10px; font-family:var(--mono); min-width:82px; }
  .med-obs  { color:var(--mist); font-size:11px; flex:1; }

  /* ── Task card (capataz) ── */
  .task-card { background:var(--ink3); border:1px solid var(--line); border-radius:var(--r2); padding:16px; margin-bottom:10px; display:flex; align-items:center; gap:14px; transition:border-color 0.15s; }
  .task-card:hover { border-color:var(--line2); }
  .task-card-body { flex:1; min-width:0; }
  .task-card-title { font-family:var(--display); font-size:14px; font-weight:600; margin-bottom:6px; letter-spacing:-0.01em; }
  .task-card-meta  { display:flex; gap:6px; align-items:center; flex-wrap:wrap; }
  .task-prog-col   { min-width:100px; }

  /* ── API indicator ── */
  .api-indicator { display:flex; align-items:center; gap:6px; font-size:10px; color:var(--dust); }
  .api-dot { width:6px; height:6px; border-radius:50%; background:var(--amber); flex-shrink:0; }
  .api-dot.ok      { background:var(--sage); box-shadow:0 0 6px var(--sage-glow); }
  .api-dot.err     { background:var(--rose); }
  .api-dot.loading { background:var(--amber); }

  /* ── Responsive ── */
  @media (max-width:900px) {
    .metrics-4 { grid-template-columns:repeat(2,1fr); }
    .med-split  { grid-template-columns:1fr !important; }
  }
`;
