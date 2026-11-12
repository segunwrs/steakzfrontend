import { useAuth } from '../auth';
import { api, gbp, when } from '../api';
import { useApi, PageHead, Card, Badge, useToast, Empty, Loading } from '../components/ui';

export default function Deliveries() {
  const { user } = useAuth();
  const toast = useToast();
  const { data, loading, reload } = useApi('/orders?limit=100');
  const move = async (o, status, msg) => {
    try { await api(`/orders/${o.id}/status`, { method: 'PATCH', body: { status } }); toast(msg); reload(); }
    catch (e) { toast(e.message, 'bad'); }
  };
  const list = data || [];
  const waiting = list.filter((o) => o.status === 'ready');
  const mine = list.filter((o) => o.status === 'out_for_delivery');
  const done = list.filter((o) => o.status === 'completed').slice(0, 10);
  const Row = ({ o, children }) => (
    <div className="drop"><div><b>#{o.id} · {o.delivery_address}</b><p className="muted small">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}</p>
      <span className="small">{gbp(o.total)} <Badge v={o.payment_status} text={o.payment_status === 'paid' ? 'Paid' : 'Collect cash'} /></span></div>{children}</div>
  );
  if (loading && !data) return <Loading />;
  return (
    <>
      <PageHead title="My deliveries" sub={`${user.branch_name} · ${mine.length} on the road`}><button className="btn ghost" onClick={reload}>Refresh</button></PageHead>
      <div className="grid2">
        <Card title={`Ready for pickup (${waiting.length})`}>{!waiting.length ? <Empty>No orders waiting.</Empty> : waiting.map((o) => <Row key={o.id} o={o}><button className="btn sm" onClick={() => move(o, 'out_for_delivery', `Picked up #${o.id}`)}>Pick up</button></Row>)}</Card>
        <Card title={`On the road (${mine.length})`}>{!mine.length ? <Empty>Nothing out for delivery.</Empty> : mine.map((o) => <Row key={o.id} o={o}><button className="btn sm" onClick={() => move(o, 'completed', `Delivered #${o.id}`)}>Delivered</button></Row>)}</Card>
        <Card title="Recently delivered" className="span2">
          {!done.length ? <Empty>No completed drops yet.</Empty> : <table className="tbl"><tbody>{done.map((o) => <tr key={o.id}><td>#{o.id}</td><td>{o.delivery_address}</td><td>{when(o.updated_at)}</td><td className="r">{gbp(o.total)}</td></tr>)}</tbody></table>}
        </Card>
      </div>
    </>
  );
}
