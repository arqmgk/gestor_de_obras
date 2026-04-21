import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ApiDot } from '../components/ui.jsx';

const shellCSS = `
  .shell { display:flex; height:100vh; overflow:hidden; }

  /* ── Sidebar ── */
  .sidebar {
    width:220px; flex-shrink:0;
    background:var(--ink2);
    border-right:1px solid var(--line);
    display:flex; flex-direction:column;
    overflow-y:auto;
  }
  .sidebar-top {
    padding:20px 16px 18px;
    border-bottom:1px solid var(--line);
  }
  .sidebar-eyebrow {
    font-size:9px; letter-spacing:0.2em;
    text-transform:uppercase; color:var(--dust);
    margin-bottom:6px;
  }
  .sidebar-title {
    font-family:var(--display);
    font-size:16px; font-weight:700;
    letter-spacing:-0.02em; color:var(--snow);
  }
  .sidebar-role-badge {
    display:inline-flex; align-items:center; gap:5px;
    margin-top:9px; padding:3px 9px;
    border-radius:20px; font-size:10px; font-weight:500;
    letter-spacing:0.03em;
  }
  .rb-arq { background:var(--arc-dim); color:var(--arc); border:1px solid var(--arc-border); }
  .rb-cap { background:var(--sage-dim); color:var(--sage); border:1px solid var(--sage-border); }

  .sidebar-nav { padding:12px 8px; flex:1; }
  .nav-section-label {
    font-size:9px; letter-spacing:0.15em;
    text-transform:uppercase; color:var(--dust);
    padding:0 8px; margin:12px 0 4px;
  }
  .nav-link {
    display:flex; align-items:center; gap:9px;
    width:100%; padding:8px 10px;
    border-radius:var(--r); border:none;
    background:none; color:var(--mist);
    font-family:var(--mono); font-size:12px;
    cursor:pointer; transition:all 0.15s;
    text-decoration:none;
  }
  .nav-link:hover { background:var(--ink3); color:var(--fog); }
  .nav-link.active-arq { background:var(--arc-dim); color:var(--arc); }
  .nav-link.active-cap { background:var(--sage-dim); color:var(--sage); }
  .nav-icon { font-size:13px; opacity:0.8; flex-shrink:0; width:16px; text-align:center; }

  .sidebar-footer {
    padding:14px 16px;
    border-top:1px solid var(--line);
    display:flex; align-items:center; justify-content:space-between;
  }
  .switch-btn {
    font-size:10px; color:var(--dust);
    background:none; border:1px solid var(--line2);
    border-radius:4px; padding:3px 8px;
    cursor:pointer; font-family:var(--mono);
    transition:all 0.15s;
  }
  .switch-btn:hover { color:var(--fog); background:var(--ink3); border-color:var(--line3); }

  /* ── Main ── */
  .main { flex:1; overflow-y:auto; background:var(--ink); }

  /* ── Page wrapper ── */
  .page { padding:28px 32px; animation:pageIn 0.22s ease; }

  /* ── Page header ── */
  .ph h1 {
    font-family:var(--display);
    font-size:26px; font-weight:800;
    letter-spacing:-0.03em; color:var(--snow); line-height:1.1;
  }
  .ph p { font-size:12px; color:var(--mist); margin-top:4px; }
  .ph { margin-bottom:24px; }
  .ph-row {
    display:flex; align-items:flex-start;
    justify-content:space-between; margin-bottom:24px;
  }

  /* ── Metrics grid ── */
  .metrics   { display:grid; gap:10px; margin-bottom:20px; }
  .metrics-4 { grid-template-columns:repeat(4,1fr); }
  .metrics-3 { grid-template-columns:repeat(3,1fr); }
  .metrics-2 { grid-template-columns:repeat(2,1fr); }
`;

export function ArqLayout() {
  const navigate = useNavigate();

  const links = [
    { to: '/arquitecto',        icon: '▦', label: 'Obras',      end: true },
    { to: '/arquitecto/nueva',  icon: '+', label: 'Nueva obra'  },
  ];

  return (
    <>
      <style>{shellCSS}</style>
      <div className="shell">
        <nav className="sidebar">
          <div className="sidebar-top">
            <div className="sidebar-eyebrow">AEC · Estudio</div>
            <div className="sidebar-title">Gestor de Obras</div>
            <div className="sidebar-role-badge rb-arq">🏛 Arquitecto</div>
          </div>

          <div className="sidebar-nav">
            <div className="nav-section-label">Estudio</div>
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) => `nav-link${isActive ? ' active-arq' : ''}`}
              >
                <span className="nav-icon">{l.icon}</span>
                {l.label}
              </NavLink>
            ))}
          </div>

          <div className="sidebar-footer">
            <ApiDot />
            <button className="switch-btn" onClick={() => navigate('/')}>cambiar rol</button>
          </div>
        </nav>

        <main className="main">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export function CapLayout() {
  const navigate = useNavigate();

  const links = [
    { to: '/capataz',           icon: '◈', label: 'Mi obra del día', end: true },
    { to: '/capataz/medicion',  icon: '◎', label: 'Cargar medición' },
  ];

  return (
    <>
      <style>{shellCSS}</style>
      <div className="shell">
        <nav className="sidebar">
          <div className="sidebar-top">
            <div className="sidebar-eyebrow">AEC · Campo</div>
            <div className="sidebar-title">Gestor de Obras</div>
            <div className="sidebar-role-badge rb-cap">🦺 Capataz</div>
          </div>

          <div className="sidebar-nav">
            <div className="nav-section-label">Campo</div>
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) => `nav-link${isActive ? ' active-cap' : ''}`}
              >
                <span className="nav-icon">{l.icon}</span>
                {l.label}
              </NavLink>
            ))}
          </div>

          <div className="sidebar-footer">
            <ApiDot />
            <button className="switch-btn" onClick={() => navigate('/')}>cambiar rol</button>
          </div>
        </nav>

        <main className="main">
          <Outlet />
        </main>
      </div>
    </>
  );
}
