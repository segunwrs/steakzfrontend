import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { api, gbp } from '../api';
import { useApi, PageHead, Card, Loading, Field, useToast, Empty } from '../components/ui';

// Till / point-of-sale for cashiers & waiters, and the online ordering screen for customers.
export default function Pos() {
  const { user } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const isCustomer = user.role === 'customer';
  const menu = useApi(isCustomer ? '/public/menu' : '/menu');
  const branches = useApi('/public/branches');
  const [cart, setCart] = useState({});
  const [cat, setCat] = useState('All');
  const [type, setType] = useState(isCustomer ? 'takeaway' : 'dine_in');
  const [table, setTable] = useState('');
  const [addr, setAddr] = useState('');
  const [branch, setBranch] = useState(user.branch_id || '');
  const [busy, setBusy] = useState(false);

  const items = (menu.data || []).filter((m) => m.available !== 0);
  const cats = ['All', ...new Set(items.map((m) => m.category))];
  const shown = cat === 'All' ? items : items.filter((m) => m.category === cat);
  const lines = Object.entries(cart).map(([id, q]) => ({ ...items.find((m) => m.id === Number(id)), q })).filter((l) => l.id);
  const total = lines.reduce((s, l) => s + l.price * l.q, 0);
  const add = (id, d = 1) => setCart((c) => { const q = (c[id] || 0) + d; const n = { ...c }; if (q <= 0) delete n[id]; else n[id] = q; return n; });

  const submit = async () => {
    setBusy(true);
    try {
      const o = await api('/orders', { method: 'POST', body: {
        branch_id: branch ? Number(branch) : undefined, type, table_no: type === 'dine_in' ? table : undefined,
        delivery_address: type === 'delivery' ? addr : undefined, items: lines.map((l) => ({ menu_item_id: l.id, quantity: l.q })),
      } });
      toast(`Order #${o.id} sent to the kitchen (${gbp(o.total)})`);
      setCart({}); setTable(''); setAddr('');
      if (isCustomer) nav('/app/orders');
    } catch (e) { toast(e.message, 'bad'); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHead title={isCustomer ? 'Order food' : 'New order'} sub={isCustomer ? 'Collection or delivery from your nearest Steakz' : `Till · ${user.branch_name || 'choose branch'}`} />
      <div className="pos">
        <div>
          <div className="tabs">{cats.map((c) => <button key={c} className={c === cat ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>)}</div>
          {menu.loading ? <Loading /> : (
            <div className="menu-grid">
              {shown.map((m) => (
                <button key={m.id} className="menu-tile" onClick={() => add(m.id)}>
                  <span className="cat">{m.category}</span><b>{m.name}</b><span className="price">{gbp(m.price)}</span>
                  {cart[m.id] && <span className="qty">{cart[m.id]}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        <Card title="Current order" className="cart">
          {(isCustomer || !user.branch_id) && (
            <Field label="Restaurant"><select value={branch} onChange={(e) => setBranch(e.target.value)}><option value="">Choose…</option>{(branches.data || []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></Field>
          )}
          <div className="seg">
            {(isCustomer ? ['takeaway', 'delivery'] : ['dine_in', 'takeaway', 'delivery']).map((t) =>
              <button key={t} className={type === t ? 'on' : ''} onClick={() => setType(t)}>{t === 'dine_in' ? 'Dine in' : t === 'takeaway' ? 'Takeaway' : 'Delivery'}</button>)}
          </div>
          {type === 'dine_in' && <Field label="Table"><input value={table} onChange={(e) => setTable(e.target.value)} placeholder="e.g. 12" /></Field>}
          {type === 'delivery' && <Field label="Delivery address"><input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Street, town, postcode" /></Field>}
          {!lines.length ? <Empty>Tap menu items to add them.</Empty> : (
            <ul className="lines">{lines.map((l) => (
              <li key={l.id}><span>{l.name}</span>
                <span className="row nowrap"><button className="btn ghost xs" onClick={() => add(l.id, -1)}>−</button><b>{l.q}</b><button className="btn ghost xs" onClick={() => add(l.id)}>+</button><span className="amt">{gbp(l.price * l.q)}</span></span>
              </li>))}
            </ul>
          )}
          <div className="total"><span>Total</span><b>{gbp(total)}</b></div>
          <button className="btn lg block" disabled={!lines.length || busy} onClick={submit}>{isCustomer ? 'Pay & place order' : 'Send to kitchen'}</button>
          {isCustomer && <small className="muted">Payment is simulated in this demo.</small>}
        </Card>
      </div>
    </>
  );
}
