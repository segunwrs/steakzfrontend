import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { Field } from '../components/ui';

const DEMO = [
  ['Admin', 'admin@steakz.co.uk'], ['HQ Manager', 'hq@steakz.co.uk'], ['Branch Mgr (Manchester)', 'manager.manchester@steakz.co.uk'],
  ['Chef (Manchester)', 'chef.manchester@steakz.co.uk'], ['Cashier (Manchester)', 'cashier.manchester@steakz.co.uk'],
  ['Driver (Manchester)', 'driver.manchester@steakz.co.uk'], ['Customer', 'emily@example.com'],
];

function AuthShell({ title, children }) {
  return (
    <div className="auth-page">
      <div className="auth-side">
        <Link to="/" className="brand"><span className="logo">S</span><div><b>Steakz</b><small>Management Information System</small></div></Link>
        <h2>One system for every branch, from the grill to head office.</h2>
        <ul className="levels">
          <li><b>Level 1 · Admin</b> branches, users, roles, audit log</li>
          <li><b>Level 2 · Management</b> HQ and branch reports, staff, stock</li>
          <li><b>Level 3 · Operations</b> kitchen, tills, delivery, customers</li>
        </ul>
      </div>
      <div className="auth-form"><div className="card">{<h1>{title}</h1>}{children}</div></div>
    </div>
  );
}

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await login(email, password); nav('/app'); } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <AuthShell title="Sign in">
      <form onSubmit={submit} className="stack">
        {err && <div className="alert">{err}</div>}
        <Field label="Email"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus /></Field>
        <Field label="Password"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
        <button className="btn lg" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p className="muted small">New customer? <Link to="/register">Create an account</Link></p>
      </form>
      <details className="demo">
        <summary>Demo accounts (password <code>Steakz@2026</code>)</summary>
        <div className="demo-list">
          {DEMO.map(([l, e]) => <button type="button" key={e} className="btn ghost sm" onClick={() => { setEmail(e); setPassword('Steakz@2026'); }}>{l}</button>)}
        </div>
      </details>
    </AuthShell>
  );
}

export function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const [err, setErr] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    try { await register(f); nav('/app'); } catch (x) { setErr(x); }
  };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <AuthShell title="Create a customer account">
      <form onSubmit={submit} className="stack">
        {err && <div className="alert">{err.message}</div>}
        <Field label="Full name" error={err?.fields?.name}><input value={f.name} onChange={set('name')} required /></Field>
        <Field label="Email" error={err?.fields?.email}><input type="email" value={f.email} onChange={set('email')} required /></Field>
        <Field label="Phone" error={err?.fields?.phone}><input value={f.phone} onChange={set('phone')} /></Field>
        <Field label="Password" error={err?.fields?.password} hint="At least 8 characters"><input type="password" value={f.password} onChange={set('password')} required minLength={8} /></Field>
        <label className="check"><input type="checkbox" required /> I agree to Steakz storing my details to process orders and bookings.</label>
        <button className="btn lg">Create account</button>
        <p className="muted small">Already registered? <Link to="/login">Sign in</Link></p>
      </form>
    </AuthShell>
  );
}
