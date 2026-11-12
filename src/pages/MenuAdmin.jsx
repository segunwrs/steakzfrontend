import { useState } from 'react';
import { useAuth } from '../auth';
import { api, gbp } from '../api';
import { useApi, PageHead, Card, Badge, Loading, Modal, Field, useToast } from '../components/ui';

export default function MenuAdmin() {
  const { user } = useAuth();
  const toast = useToast();
  const canEdit = ['admin', 'hq_manager'].includes(user.role);
  const { data, loading, reload } = useApi('/menu');
  const [edit, setEdit] = useState(null);
  const save = async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target));
    fd.available = fd.available === 'on';
    try { await api(edit.id ? `/menu/${edit.id}` : '/menu', { method: edit.id ? 'PUT' : 'POST', body: fd }); toast('Menu saved'); setEdit(null); reload(); }
    catch (x) { toast(x.message, 'bad'); }
  };
  return (
    <>
      <PageHead title="Menu" sub={canEdit ? 'Group-wide menu, prices and allergen information' : 'Current menu and allergens'}>{canEdit && <button className="btn" onClick={() => setEdit({ available: 1 })}>Add item</button>}</PageHead>
      <Card>
        {loading && !data ? <Loading /> : (
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>Item</th><th>Category</th><th>Allergens</th><th className="r">Price</th><th>Status</th>{canEdit && <th />}</tr></thead>
            <tbody>{(data || []).map((m) => (
              <tr key={m.id}><td><b>{m.name}</b><br /><small className="muted">{m.description}</small></td><td>{m.category}</td><td className="small">{m.allergens || '—'}</td><td className="r">{gbp(m.price)}</td>
                <td>{m.available ? <Badge v="paid" text="On menu" /> : <Badge v="cancelled" text="Hidden" />}</td>{canEdit && <td><button className="btn ghost sm" onClick={() => setEdit(m)}>Edit</button></td>}</tr>))}
            </tbody>
          </table></div>
        )}
      </Card>
      {edit && (
        <Modal title={edit.id ? `Edit ${edit.name}` : 'New menu item'} onClose={() => setEdit(null)}>
          <form onSubmit={save} className="stack">
            <Field label="Name"><input name="name" defaultValue={edit.name} required /></Field>
            <div className="row"><Field label="Category"><input name="category" defaultValue={edit.category} required list="cats" /></Field><Field label="Price (£)"><input name="price" type="number" step="0.01" min="0" defaultValue={edit.price} required /></Field></div>
            <datalist id="cats">{[...new Set((data || []).map((m) => m.category))].map((c) => <option key={c} value={c} />)}</datalist>
            <Field label="Description"><input name="description" defaultValue={edit.description || ''} /></Field>
            <Field label="Allergens" hint="Required by UK food law (14 major allergens)"><input name="allergens" defaultValue={edit.allergens || ''} /></Field>
            <label className="check"><input type="checkbox" name="available" defaultChecked={!!edit.available} /> Available to order</label>
            <div className="row"><button className="btn">Save</button>
              {edit.id && <button type="button" className="btn danger ghost" onClick={async () => { const r = await api(`/menu/${edit.id}`, { method: 'DELETE' }); toast(r.message); setEdit(null); reload(); }}>Delete</button>}</div>
          </form>
        </Modal>
      )}
    </>
  );
}
