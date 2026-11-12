import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../auth';
import { NAV } from '../nav';
import { ROLE_LABEL, LEVEL_LABEL } from '../api';

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const items = NAV[user.role] || [];
  return (
    <div className={`shell ${open ? 'nav-open' : ''}`}>
      <aside className="side">
        <div className="brand"><span className="logo">S</span><div><b>Steakz</b><small>Management Information System</small></div></div>
        <div className={`level-chip l${user.access_level}`}>{LEVEL_LABEL[user.access_level]}</div>
        <nav onClick={() => setOpen(false)}>
          {items.map(([to, text, icon]) => (
            <NavLink key={to} to={to} end={to === '/app'}><span className="ico">{icon}</span>{text}</NavLink>
          ))}
          <NavLink to="/app/account"><span className="ico">⚙</span>My account</NavLink>
        </nav>
        <div className="side-foot">
          <div className="who"><b>{user.name}</b><small>{ROLE_LABEL[user.role]}{user.branch_name ? ` · ${user.branch_name.replace('Steakz ', '')}` : ''}</small></div>
          <button className="btn ghost sm light" onClick={() => { logout(); nav('/login'); }}>Sign out</button>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <button className="btn ghost sm burger" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
          <span className="muted small">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span className="spacer" />
          {user.branch_name && <span className="branch-pill">{user.branch_name}</span>}
          {!user.branch_name && user.role !== 'customer' && <span className="branch-pill all">All branches</span>}
        </header>
        <div className="content"><Outlet /></div>
      </div>
    </div>
  );
}
