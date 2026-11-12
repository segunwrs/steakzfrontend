import { useState } from 'react';
import { useAuth } from '../auth';
import { api } from '../api';
import { useApi, PageHead, Card, Badge, Loading, Modal, Field, useToast, Empty } from '../components/ui';

export default function Reservations() {
  const { user } = useAuth();
  const toast = useToast();
  const isCustomer = user.role === 'customer';
  const [upcoming, setUpcoming] = useState(true);
  const { data, loading, reload } = useApi(`/reservations${upcoming ? '?upcoming=1' : ''}`);
  const branches = useApi('/public/branches');
  const [adding, setAdding] = useState(false);
  const staff = ['cashier', 'branch_manager', 'admin'].includes(user.role);

  const setStatus = async (r, status) => {
    try { await api(`/reservations/${r.id}`, { method: 'PATCH', body: { status } }); toast('Booking updated'); reload(); }
    catch (e) { toast(e.message, 'bad'); }
  };
  const add = async (e) => {
    e.preventDefault();
    try { await api('/reservations', { method: 'POST', body: Object.fromEntries(new FormData(e.target)) }); toast('Table booked'); setAdding(false); reload(); }
    catch (x) { toast(x.message, 'bad'); }
  };

  return (
    <>
      <PageHead title={isCustomer ? 'My bookings' : 'Reservations'} sub={isCustomer ? '' : user.branch_name || 'All branches'}>
        <label className="check"><input type="checkbox" checked={upcoming} onChange={(e) => setUpcoming(e.target.checked)} /> Upcoming only</label>
        {user.role !== 'hq_manager' && <button className="btn" onClick={() => setAdding(true)}>New booking</button>}
      </PageHead>
      <Card>
        {loading && !data ? <Loading /> : !data?.length ? <Empty>No bookings.</Empty> : (
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>Date</th><th>Time</th>{!user.branch_id && <th>Branch</th>}<th>Name</th>{!isCustomer && <th>Phone</th>}<th className="r">Guests</th><th>Status</th><th /></tr></thead>
            <tbody>{data.map((r) => (
              <tr key={r.id}><td className="nowrap">{new Date(r.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</td><td>{r.time}</td>
                {!user.branch_id && <td>{r.branch_name.replace('Steakz ', '')}</td>}<td>{r.name}</td>{!isCustomer && <td>{r.phone}</td>}<td className="r">{r.party_size}</td><td><Badge v={r.status} /></td>
                <td className="row nowrap">{r.status === 'booked' && staff && <><button className="btn sm" onClick={() => setStatus(r, 'seated')}>Seat</button><button className="btn ghost sm" onClick={() => setStatus(r, 'no_show')}>No-show</button></>}
                  {r.status === 'booked' && (staff || isCustomer) && <button className="btn danger ghost sm" onClick={() => setStatus(r, 'cancelled')}>Cancel</button>}</td>
              </tr>))}
            </tbody>
          </table></div>
        )}
      </Card>
      {adding && (
        <Modal title="New booking" onClose={() => setAdding(false)}>
          <form onSubmit={add} className="stack">
            {!user.branch_id && <Field label="Restaurant"><select name="branch_id" required>{(branches.data || []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></Field>}
            <Field label="Name"><input name="name" defaultValue={isCustomer ? user.name : ''} required /></Field>
            <Field label="Phone"><input name="phone" defaultValue={isCustomer ? user.phone || '' : ''} required /></Field>
            <div className="row"><Field label="Date"><input type="date" name="date" min={new Date().toISOString().slice(0, 10)} required /></Field>
              <Field label="Time"><input type="time" name="time" defaultValue="19:00" required /></Field>
              <Field label="Guests"><input type="number" name="party_size" min="1" max="20" defaultValue="2" required /></Field></div>
            <button className="btn">Book</button>
          </form>
        </Modal>
      )}
    </>
  );
}
