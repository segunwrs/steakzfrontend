import { useEffect } from 'react';
import { useAuth } from '../auth';
import { api, when, label } from '../api';
import { useApi, PageHead, Badge, useToast, Empty } from '../components/ui';

// Kitchen display: tickets move pending → preparing → ready. Refreshes every 20s.
export default function Kitchen() {
  const { user } = useAuth();
  const toast = useToast();
  const { data, reload } = useApi('/orders?status=pending,preparing,ready&limit=200');
  useEffect(() => { const t = setInterval(reload, 20000); return () => clearInterval(t); }, [reload]);
  const move = async (o, status) => {
    try { await api(`/orders/${o.id}/status`, { method: 'PATCH', body: { status } }); toast(`#${o.id} → ${label(status)}`); reload(); }
    catch (e) { toast(e.message, 'bad'); }
  };
  const cols = [['pending', 'New', 'preparing', 'Start'], ['preparing', 'Cooking', 'ready', 'Ready'], ['ready', 'Ready to go', null, null]];
  const all = (data || []).slice().reverse();
  return (
    <>
      <PageHead title="Kitchen board" sub={`${user.branch_name || 'All branches'} · live tickets`}><button className="btn ghost" onClick={reload}>Refresh</button></PageHead>
      <div className="kanban">
        {cols.map(([st, title, next, btn]) => {
          const list = all.filter((o) => o.status === st);
          return (
            <div key={st} className="lane"><h3>{title} <span className="count">{list.length}</span></h3>
              {!list.length && <Empty>Nothing here</Empty>}
              {list.map((o) => (
                <div key={o.id} className={`ticket ${st}`}>
                  <div className="ticket-head"><b>#{o.id}</b><span>{label(o.type)}{o.table_no ? ` · T${o.table_no}` : ''}</span><small>{when(o.created_at).split(', ')[1]}</small></div>
                  <ul>{o.items.map((i) => <li key={i.id}><b>{i.quantity}×</b> {i.name}</li>)}</ul>
                  {o.notes && <p className="note">{o.notes}</p>}
                  {next ? <button className="btn sm block" onClick={() => move(o, next)}>{btn}</button> : <Badge v={o.payment_status} />}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}
