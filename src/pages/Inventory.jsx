import { useState } from 'react';
import { useAuth } from '../auth';
import { api, when } from '../api';
import { useApi, PageHead, Card, Badge, Loading, Modal, Field, useToast, ErrorBox } from '../components/ui';

export default function Inventory() {
  const { user } = useAuth();
  const toast = useToast();
  const global = ['admin', 'hq_manager'].includes(user.role);
  const [branch, setBranch] = useState('');
  const [low, setLow] = useState(false);
  const branches = useApi(global ? '/branches' : null);
  const { data, loading, error, reload } = useApi(`/inventory?${branch ? `branch_id=${branch}&` : ''}${low ? 'low=1' : ''}`);
  const [edit, setEdit] = useState(null);
  const [adding, setAdding] = useState(false);
  const canEdit = ['admin', 'branch_manager', 'chef'].includes(user.role);
  const canManage = ['admin', 'branch_manager'].includes(user.role);

  const save = async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target));
    try {
      if (adding) await api('/inventory', { method: 'POST', body: fd });
      else await api(`/inventory/${edit.id}`, { method: 'PATCH', body: fd });
      toast('Stock saved'); setEdit(null); setAdding(false); reload();
    } catch (x) { toast(x.message, 'bad'); }
  };

  return (
    <>
      <PageHead title={user.role === 'chef' ? 'Stock count' : 'Inventory'} sub={global ? 'Stock levels across all branches (read-only for HQ)' : user.branch_name}>
        {global && <select value={branch} onChange={(e) => setBranch(e.target.value)} aria-label="Branch"><option value="">All branches</option>{(branches.data || []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>}
        <label className="check"><input type="checkbox" checked={low} onChange={(e) => setLow(e.target.checked)} /> Low stock only</label>
        {canManage && <button className="btn" onClick={() => setAdding(true)}>Add item</button>}
      </PageHead>
      <ErrorBox error={error} />
      <Card>
        {loading && !data ? <Loading /> : (
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr>{global && <th>Branch</th>}<th>Item</th><th className="r">On hand</th><th className="r">Reorder level</th><th>Status</th><th>Last updated</th>{canEdit && <th />}</tr></thead>
            <tbody>{(data || []).map((i) => (
              <tr key={i.id}>{global && <td>{i.branch_name.replace('Steakz ', '')}</td>}<td>{i.name}</td><td className="r"><b>{i.quantity}</b> {i.unit}</td><td className="r">{i.reorder_level} {i.unit}</td>
                <td>{i.low_stock ? <Badge v="unpaid" text="Reorder" /> : <Badge v="paid" text="OK" />}</td><td className="muted small">{when(i.updated_at)}</td>
                {canEdit && <td><button className="btn ghost sm" onClick={() => setEdit(i)}>{user.role === 'chef' ? 'Count' : 'Edit'}</button></td>}
              </tr>))}
            </tbody>
          </table></div>
        )}
      </Card>
      {(edit || adding) && (
        <Modal title={adding ? 'Add stock item' : `Update ${edit.name}`} onClose={() => { setEdit(null); setAdding(false); }}>
          <form onSubmit={save} className="stack">
            {adding && global && <Field label="Branch"><select name="branch_id" required>{(branches.data || []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></Field>}
            {(adding || user.role !== 'chef') && <Field label="Name"><input name="name" defaultValue={edit?.name} required /></Field>}
            {(adding || user.role !== 'chef') && <Field label="Unit"><input name="unit" defaultValue={edit?.unit || 'kg'} required /></Field>}
            <Field label="Quantity on hand"><input name="quantity" type="number" step="0.1" min="0" defaultValue={edit?.quantity ?? 0} required autoFocus /></Field>
            {(adding || user.role !== 'chef') && <Field label="Reorder level"><input name="reorder_level" type="number" step="0.1" min="0" defaultValue={edit?.reorder_level ?? 0} required /></Field>}
            <div className="row"><button className="btn">Save</button>
              {edit && canManage && <button type="button" className="btn danger ghost" onClick={async () => { await api(`/inventory/${edit.id}`, { method: 'DELETE' }); setEdit(null); reload(); }}>Remove</button>}</div>
          </form>
        </Modal>
      )}
    </>
  );
}
