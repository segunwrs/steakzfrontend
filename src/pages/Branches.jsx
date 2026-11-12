import { useState } from 'react';
import { useAuth } from '../auth';
import { api } from '../api';
import { useApi, PageHead, Card, Badge, Loading, Modal, Field, useToast } from '../components/ui';

export default function Branches() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user.role === 'admin';
  const { data, loading, reload } = useApi('/branches');
  const [edit, setEdit] = useState(null);
  const save = async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target));
    fd.active = fd.active === 'on';
    try {
      await api(edit.id ? `/branches/${edit.id}` : '/branches', { method: edit.id ? 'PUT' : 'POST', body: fd });
      toast('Branch saved'); setEdit(null); reload();
    } catch (x) { toast(x.message, 'bad'); }
  };
  const remove = async () => {
    if (!window.confirm(`Remove ${edit.name}?`)) return;
    try { const r = await api(`/branches/${edit.id}`, { method: 'DELETE' }); toast(r.message); setEdit(null); reload(); } catch (x) { toast(x.message, 'bad'); }
  };
  return (
    <>
      <PageHead title="Branches" sub="Restaurants in the Steakz group">{isAdmin && <button className="btn" onClick={() => setEdit({ active: 1 })}>Add branch</button>}</PageHead>
      {loading && !data ? <Loading /> : (
        <div className="grid3">
          {(data || []).map((b) => (
            <Card key={b.id} title={b.name} action={<Badge v={b.active ? 'paid' : 'cancelled'} text={b.active ? 'Open' : 'Closed'} />}>
              <p className="muted">{b.address}</p><p>{b.phone}</p><p>{b.seats} seats · {b.staff_count} staff</p>
              {isAdmin && <button className="btn ghost sm" onClick={() => setEdit(b)}>Edit</button>}
            </Card>
          ))}
        </div>
      )}
      {edit && (
        <Modal title={edit.id ? `Edit ${edit.name}` : 'New branch'} onClose={() => setEdit(null)}>
          <form onSubmit={save} className="stack">
            <Field label="Name"><input name="name" defaultValue={edit.name} required /></Field>
            <Field label="City"><input name="city" defaultValue={edit.city} required /></Field>
            <Field label="Address"><input name="address" defaultValue={edit.address} required /></Field>
            <div className="row"><Field label="Phone"><input name="phone" defaultValue={edit.phone} /></Field><Field label="Seats"><input name="seats" type="number" min="1" defaultValue={edit.seats || 80} /></Field></div>
            <label className="check"><input type="checkbox" name="active" defaultChecked={!!edit.active} /> Open for trading</label>
            <div className="row"><button className="btn">Save</button>{edit.id && <button type="button" className="btn danger ghost" onClick={remove}>Delete</button>}</div>
          </form>
        </Modal>
      )}
    </>
  );
}
