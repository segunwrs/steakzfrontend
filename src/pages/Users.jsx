import { useState } from 'react';
import { useAuth } from '../auth';
import { api, ROLE_LABEL } from '../api';
import { useApi, PageHead, Card, Badge, Loading, Modal, Field, useToast } from '../components/ui';

const BRANCH_ROLES = ['branch_manager', 'chef', 'cashier', 'delivery'];

export default function Users() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user.role === 'admin';
  const readOnly = user.role === 'hq_manager';
  const [role, setRole] = useState('');
  const [q, setQ] = useState('');
  const { data, loading, reload } = useApi(`/users?${role ? `role=${role}&` : ''}${q ? `q=${encodeURIComponent(q)}` : ''}`);
  const branches = useApi('/branches');
  const [edit, setEdit] = useState(null); // {} = new user
  const [formRole, setFormRole] = useState('cashier');
  const roles = isAdmin ? Object.keys(ROLE_LABEL) : ['chef', 'cashier', 'delivery'];

  const open = (u) => { setEdit(u); setFormRole(u.role || 'cashier'); };
  const save = async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target));
    if (!fd.password) delete fd.password;
    if (fd.branch_id === '') delete fd.branch_id;
    fd.active = fd.active === 'on';
    try {
      if (edit.id) await api(`/users/${edit.id}`, { method: 'PUT', body: fd });
      else await api('/users', { method: 'POST', body: fd });
      toast(edit.id ? 'User updated' : 'User created'); setEdit(null); reload();
    } catch (x) { toast(x.fields ? Object.entries(x.fields).map(([k, v]) => `${k} ${v}`).join('; ') : x.message, 'bad'); }
  };
  const remove = async () => {
    if (!window.confirm(`Delete ${edit.name}? This cannot be undone.`)) return;
    try { await api(`/users/${edit.id}`, { method: 'DELETE' }); toast('User deleted'); setEdit(null); reload(); } catch (x) { toast(x.message, 'bad'); }
  };

  return (
    <>
      <PageHead title={isAdmin ? 'Users & roles' : readOnly ? 'Staff directory' : 'My staff'} sub={isAdmin ? 'Create staff and admin accounts, change roles, disable or delete users' : user.branch_name}>
        <input placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
        <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role"><option value="">All roles</option>{Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        {!readOnly && <button className="btn" onClick={() => open({})}>Add user</button>}
      </PageHead>
      <Card>
        {loading && !data ? <Loading /> : (
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Access</th><th>Branch</th><th>Status</th>{!readOnly && <th />}</tr></thead>
            <tbody>{(data || []).map((u) => (
              <tr key={u.id}><td><b>{u.name}</b></td><td>{u.email}</td><td><Badge v={u.role} text={ROLE_LABEL[u.role]} /></td><td className="small">Level {u.access_level}</td>
                <td>{u.branch_name || <span className="muted">—</span>}</td><td>{u.active ? <Badge v="paid" text="Active" /> : <Badge v="cancelled" text="Disabled" />}</td>
                {!readOnly && <td><button className="btn ghost sm" onClick={() => open(u)}>Edit</button></td>}</tr>))}
            </tbody>
          </table></div>
        )}
      </Card>
      {edit && (
        <Modal title={edit.id ? `Edit ${edit.name}` : 'New user'} onClose={() => setEdit(null)}>
          <form onSubmit={save} className="stack">
            <Field label="Full name"><input name="name" defaultValue={edit.name} required /></Field>
            <Field label="Email"><input name="email" type="email" defaultValue={edit.email} required /></Field>
            <Field label="Role"><select name="role" value={formRole} onChange={(e) => setFormRole(e.target.value)}>{roles.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select></Field>
            {isAdmin && BRANCH_ROLES.includes(formRole) && (
              <Field label="Branch"><select name="branch_id" defaultValue={edit.branch_id || ''} required><option value="">Choose…</option>{(branches.data || []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></Field>
            )}
            <Field label={edit.id ? 'Reset password' : 'Password'} hint={edit.id ? 'Leave blank to keep the current password' : 'At least 8 characters'}>
              <input name="password" type="password" minLength={8} required={!edit.id} autoComplete="new-password" />
            </Field>
            {edit.id && <label className="check"><input type="checkbox" name="active" defaultChecked={edit.active !== false} /> Account active</label>}
            {!edit.id && <input type="hidden" name="active" value="on" />}
            <div className="row"><button className="btn">Save</button>{isAdmin && edit.id && edit.id !== user.id && <button type="button" className="btn danger ghost" onClick={remove}>Delete user</button>}</div>
          </form>
        </Modal>
      )}
    </>
  );
}
