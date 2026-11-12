import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { api, label } from '../api';

// Data loader hook: const { data, loading, error, reload } = useApi('/orders')
export function useApi(path, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const load = useCallback(() => {
    if (!path) return;
    setState((s) => ({ ...s, loading: true }));
    api(path).then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => setState({ data: null, loading: false, error }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps]);
  useEffect(load, [load]);
  return { ...state, reload: load };
}

const ToastCtx = createContext(() => {});
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((msg, kind = 'ok') => {
    const id = Math.random();
    setItems((x) => [...x, { id, msg, kind }]);
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), 3500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts">{items.map((t) => <div key={t.id} className={`toast ${t.kind}`}>{t.msg}</div>)}</div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

export function PageHead({ title, sub, children }) {
  return (
    <div className="page-head">
      <div><h1>{title}</h1>{sub && <p className="muted">{sub}</p>}</div>
      <div className="page-actions">{children}</div>
    </div>
  );
}

export const Card = ({ title, action, children, className = '' }) => (
  <section className={`card ${className}`}>
    {(title || action) && <div className="card-head"><h3>{title}</h3>{action}</div>}
    {children}
  </section>
);

export const Stat = ({ label: l, value, hint, tone }) => (
  <div className={`stat ${tone || ''}`}><span className="stat-label">{l}</span><strong>{value}</strong>{hint && <span className="stat-hint">{hint}</span>}</div>
);

const TONES = {
  pending: 'amber', preparing: 'blue', ready: 'green', out_for_delivery: 'violet', completed: 'grey', cancelled: 'red',
  paid: 'green', unpaid: 'amber', refunded: 'red', booked: 'blue', seated: 'green', no_show: 'red',
  admin: 'red', hq_manager: 'violet', branch_manager: 'blue', chef: 'amber', cashier: 'green', delivery: 'teal', customer: 'grey',
};
export const Badge = ({ v, text }) => <span className={`badge ${TONES[v] || 'grey'}`}>{text || label(v)}</span>;

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-label={title}>
        <div className="card-head"><h3>{title}</h3><button className="btn ghost sm" onClick={onClose} aria-label="Close">✕</button></div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label: l, error, children, hint }) {
  return (
    <label className={`field ${error ? 'has-error' : ''}`}>
      <span>{l}</span>{children}{hint && !error && <small className="muted">{hint}</small>}{error && <small className="err">{l} {error}</small>}
    </label>
  );
}

export const Empty = ({ children }) => <div className="empty">{children}</div>;
export const Loading = () => <div className="empty">Loading…</div>;
export const ErrorBox = ({ error }) => error ? <div className="alert">{error.message}</div> : null;
