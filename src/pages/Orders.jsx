import { useState } from 'react';
import { useAuth } from '../auth';
import { api, gbp, when, label } from '../api';
import { useApi, PageHead, Card, Badge, Loading, ErrorBox, Empty, Modal, useToast } from '../components/ui';

export function OrderActions({ o, onDone }) {
  const { user } = useAuth();
  const toast = useToast();
  const r = user.role;
  const act = async (path, body, msg) => {
    try { await api(`/orders/${o.id}/${path}`, { method: 'PATCH', body }); toast(msg); onDone?.(); }
    catch (e) { toast(e.message, 'bad'); }
  };
  const status = (s, msg) => act('status', { status: s }, msg);
  const can = (...roles) => r === 'admin' || roles.includes(r);
  const btns = [];
  if (o.payment_status === 'unpaid' && o.status !== 'cancelled' && o.type !== 'delivery' && can('cashier', 'branch_manager')) {
    btns.push(<button key="card" className="btn sm" onClick={() => act('payment', { payment_method: 'card' }, 'Card payment taken')}>Take card</button>);
    btns.push(<button key="cash" className="btn ghost sm" onClick={() => act('payment', { payment_method: 'cash' }, 'Cash payment taken')}>Cash</button>);
  }
  if (o.status === 'ready' && o.type !== 'delivery' && o.payment_status === 'paid' && can('cashier', 'branch_manager'))
    btns.push(<button key="srv" className="btn sm" onClick={() => status('completed', 'Order completed')}>{o.type === 'dine_in' ? 'Served' : 'Collected'}</button>);
  if (o.status === 'pending' && (can('cashier', 'branch_manager') || r === 'customer'))
    btns.push(<button key="cx" className="btn danger sm" onClick={() => status('cancelled', 'Order cancelled')}>Cancel</button>);
  return <div className="row nowrap">{btns}</div>;
}

export default function Orders() {
  const { user } = useAuth();
  const [st, setSt] = useState('');
  const [branch, setBranch] = useState('');
  const [view, setView] = useState(null);
  const global = ['admin', 'hq_manager'].includes(user.role);
  const branches = useApi(global ? '/branches' : null);
  const { data, loading, error, reload } = useApi(`/orders?limit=150${st ? `&status=${st}` : ''}${branch ? `&branch_id=${branch}` : ''}`);
  const isCustomer = user.role === 'customer';

  return (
    <>
      <PageHead title={isCustomer ? 'My orders' : 'Orders'} sub={isCustomer ? 'Track your takeaway and delivery orders' : global ? 'Every order across the group' : `Orders at ${user.branch_name}`}>
        {global && <select value={branch} onChange={(e) => setBranch(e.target.value)} aria-label="Branch"><option value="">All branches</option>{(branches.data || []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>}
        <select value={st} onChange={(e) => setSt(e.target.value)} aria-label="Status">
          <option value="">All statuses</option>
          <option value="pending,preparing,ready,out_for_delivery">Open</option>
          {['pending', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled'].map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
        <button className="btn ghost" onClick={reload}>Refresh</button>
      </PageHead>
      <ErrorBox error={error} />
      <Card>
        {loading && !data ? <Loading /> : !data?.length ? <Empty>No orders found.</Empty> : (
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>#</th><th>Time</th>{global && <th>Branch</th>}<th>Type</th><th>Items</th><th className="r">Total</th><th>Status</th><th>Payment</th>{user.role !== 'hq_manager' && <th />}</tr></thead>
            <tbody>{data.map((o) => (
              <tr key={o.id} className="click" onClick={() => setView(o)}>
                <td>{o.id}</td><td className="nowrap">{when(o.created_at)}</td>{global && <td>{o.branch_name.replace('Steakz ', '')}</td>}
                <td>{label(o.type)}{o.table_no ? ` · T${o.table_no}` : ''}</td>
                <td className="clip">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}</td>
                <td className="r">{gbp(o.total)}</td><td><Badge v={o.status} /></td><td><Badge v={o.payment_status} /></td>
                {user.role !== 'hq_manager' && <td onClick={(e) => e.stopPropagation()}><OrderActions o={o} onDone={reload} /></td>}
              </tr>))}
            </tbody>
          </table></div>
        )}
      </Card>
      {view && (
        <Modal title={`Order #${view.id}`} onClose={() => setView(null)}>
          <p className="muted">{view.branch_name} · {when(view.created_at)} · {label(view.type)} {view.table_no && `· Table ${view.table_no}`}</p>
          {view.delivery_address && <p>Deliver to: {view.delivery_address}{view.driver_name ? ` (driver: ${view.driver_name})` : ''}</p>}
          <table className="tbl"><tbody>{view.items.map((i) => <tr key={i.id}><td>{i.quantity}× {i.name}</td><td className="r">{gbp(i.unit_price * i.quantity)}</td></tr>)}
            <tr><td><b>Total</b></td><td className="r"><b>{gbp(view.total)}</b></td></tr></tbody></table>
          <p><Badge v={view.status} /> <Badge v={view.payment_status} /> {view.payment_method && <span className="muted small">via {view.payment_method}</span>}</p>
          {view.created_by_name && <p className="muted small">Taken by {view.created_by_name}</p>}
        </Modal>
      )}
    </>
  );
}
