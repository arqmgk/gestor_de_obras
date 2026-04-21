import { useNavigate } from 'react-router-dom';

const css = `
  .role-screen {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 52px;
    background:
      radial-gradient(ellipse 55% 45% at 25% 65%, rgba(91,141,238,0.08) 0%, transparent 65%),
      radial-gradient(ellipse 45% 55% at 78% 28%, rgba(78,203,160,0.06) 0%, transparent 65%),
      var(--ink);
    animation: fadeIn 0.4s ease;
  }

  .role-brand { text-align: center; }
  .role-brand .eyebrow {
    font-family: var(--mono);
    font-size: 10px; letter-spacing: 0.22em;
    text-transform: uppercase; color: var(--dust);
    margin-bottom: 12px;
  }
  .role-brand h1 {
    font-family: var(--display);
    font-size: clamp(36px, 5vw, 56px);
    font-weight: 800; letter-spacing: -0.03em;
    color: var(--snow); line-height: 1.1;
  }
  .role-brand h1 em { color: var(--arc); font-style: normal; }
  .role-brand .sub {
    margin-top: 10px; font-size: 12px; color: var(--mist);
    letter-spacing: 0.02em;
  }

  .role-cards { display: flex; gap: 16px; }

  .role-card {
    width: 210px; padding: 28px 22px;
    background: var(--ink2);
    border: 1px solid var(--line2);
    border-radius: var(--r3);
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    text-align: center;
    position: relative; overflow: hidden;
    animation: slideUp 0.4s ease both;
  }
  .role-card:nth-child(2) { animation-delay: 0.07s; }

  .role-card::before {
    content: ''; position: absolute; inset: 0;
    opacity: 0; transition: opacity 0.2s; border-radius: var(--r3);
  }
  .role-card.arq::before { background: radial-gradient(ellipse at 50% 0%, var(--arc-dim), transparent 70%); }
  .role-card.cap::before { background: radial-gradient(ellipse at 50% 0%, var(--sage-dim), transparent 70%); }

  .role-card:hover { transform: translateY(-4px); }
  .role-card:hover::before { opacity: 1; }
  .role-card.arq:hover { border-color: var(--arc-border); box-shadow: 0 16px 48px rgba(91,141,238,0.12); }
  .role-card.cap:hover { border-color: var(--sage-border); box-shadow: 0 16px 48px rgba(78,203,160,0.12); }

  .role-icon {
    width: 50px; height: 50px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; margin: 0 auto 14px;
  }
  .role-card.arq .role-icon { background: var(--arc-dim); }
  .role-card.cap .role-icon { background: var(--sage-dim); }

  .role-card h2 {
    font-family: var(--display);
    font-size: 17px; font-weight: 700;
    letter-spacing: -0.02em; margin-bottom: 6px;
  }
  .role-card p { font-size: 11px; color: var(--mist); line-height: 1.55; }

  .role-card .role-enter {
    display: inline-flex; align-items: center; gap: 5px;
    margin-top: 18px; font-size: 11px;
    font-family: var(--mono); letter-spacing: 0.05em;
    opacity: 0; transition: opacity 0.15s;
  }
  .role-card.arq .role-enter { color: var(--arc); }
  .role-card.cap .role-enter { color: var(--sage); }
  .role-card:hover .role-enter { opacity: 1; }
`;

export default function RolePage() {
  const navigate = useNavigate();

  return (
    <>
      <style>{css}</style>
      <div className="role-screen">
        <div className="role-brand">
          <div className="eyebrow">AEC · Portfolio</div>
          <h1>Gestor de <em>Obras</em></h1>
          <p className="sub">Seleccioná tu rol para continuar</p>
        </div>

        <div className="role-cards">
          <div className="role-card arq" onClick={() => navigate('/arquitecto')}>
            <div className="role-icon">🏛</div>
            <h2>Arquitecto</h2>
            <p>Gestión completa de obras, tareas, progreso y documentación técnica</p>
            <div className="role-enter">Entrar →</div>
          </div>

          <div className="role-card cap" onClick={() => navigate('/capataz')}>
            <div className="role-icon">🦺</div>
            <h2>Capataz</h2>
            <p>Vista de campo: tareas asignadas y registro de mediciones</p>
            <div className="role-enter">Entrar →</div>
          </div>
        </div>
      </div>
    </>
  );
}
