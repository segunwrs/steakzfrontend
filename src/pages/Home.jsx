import { Link } from 'react-router-dom';
import { useState } from 'react';
import { api, gbp } from '../api';
import { useApi, Field, useToast } from '../components/ui';
import { useAuth } from '../auth';

// Open area (access level 0): menu, branches and table booking without logging in.
export default function Home() {
  const { user } = useAuth();
  const menu = useApi('/public/menu');
  const branches = useApi('/public/branches');
  const toast = useToast();
  const [f, setF] = useState({ branch_id: '', name: '', phone: '', date: '', time: '19:00', party_size: 2 });
  const [errs, setErrs] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const book = async (e) => {
    e.preventDefault();
    try {
      const r = await api('/public/reservations', { method: 'POST', body: f });
      toast(r.message); setErrs({}); setF({ ...f, name: '', phone: '' });
    } catch (err) { setErrs(err.fields || {}); toast(err.message, 'bad'); }
  };

  const cats = {};
  (menu.data || []).forEach((m) => { (cats[m.category] ||= []).push(m); });

  return (
    <div className="public">
      <header className="pub-nav">
        <div className="brand dark"><span className="logo">S</span><b>Steakz</b></div>
        <nav><a href="#menu">Menu</a><a href="#branches">Restaurants</a><a href="#book">Book a table</a></nav>
        {user ? <Link className="btn" to="/app">Open portal</Link> : <div className="row"><Link className="btn ghost" to="/login">Staff & customer login</Link><Link className="btn" to="/register">Sign up</Link></div>}
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">Dry-aged British beef · since 2012</p>
          <h1>Proper steak, cooked properly.</h1>
          <p className="lead">Three restaurants across London, Manchester and Leeds. Book a table, order for collection or get it delivered.</p>
          <div className="row"><a className="btn lg" href="#book">Book a table</a><Link className="btn ghost lg" to={user ? '/app' : '/register'}>Order online</Link></div>
        </div>
        <div className="hero-card">
          <span className="eyebrow">Tonight's favourite</span>
          <h2>Ribeye 10oz</h2><p>28-day dry-aged, triple-cooked chips, peppercorn sauce.</p><b className="price">{gbp(29.5)}</b>
        </div>
      </section>

      <section id="menu" className="pub-section">
        <h2>Menu</h2>
        <div className="menu-cols">
          {Object.entries(cats).map(([c, items]) => (
            <div key={c} className="menu-cat"><h3>{c}</h3>
              {items.map((m) => (
                <div className="menu-line" key={m.id}>
                  <div><b>{m.name}</b>{m.description && <p>{m.description}</p>}{m.allergens && <small className="allergen">Allergens: {m.allergens}</small>}</div>
                  <span>{gbp(m.price)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section id="branches" className="pub-section alt">
        <h2>Our restaurants</h2>
        <div className="grid3">
          {(branches.data || []).map((b) => (
            <div className="card" key={b.id}><h3>{b.name}</h3><p className="muted">{b.address}</p><p>{b.phone} · {b.seats} seats</p></div>
          ))}
        </div>
      </section>

      <section id="book" className="pub-section">
        <h2>Book a table</h2>
        <form className="card form-grid" onSubmit={book}>
          <Field label="Restaurant" error={errs.branch_id}>
            <select value={f.branch_id} onChange={set('branch_id')} required>
              <option value="">Choose…</option>{(branches.data || []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
          <Field label="Name" error={errs.name}><input value={f.name} onChange={set('name')} required /></Field>
          <Field label="Phone" error={errs.phone}><input value={f.phone} onChange={set('phone')} required /></Field>
          <Field label="Date" error={errs.date}><input type="date" value={f.date} min={new Date().toISOString().slice(0, 10)} onChange={set('date')} required /></Field>
          <Field label="Time" error={errs.time}><input type="time" value={f.time} onChange={set('time')} required /></Field>
          <Field label="Guests" error={errs.party_size}><input type="number" min="1" max="20" value={f.party_size} onChange={set('party_size')} required /></Field>
          <div className="span-all"><button className="btn lg">Confirm booking</button>
            <small className="muted"> We only use your phone number to contact you about this booking (UK GDPR).</small></div>
        </form>
      </section>
      <footer className="pub-foot">© Steakz Restaurants Ltd · MIS demo built by DATASAP</footer>
    </div>
  );
}
