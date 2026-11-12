import { Link } from 'react-router-dom';
import { useApi, PageHead, Card, Stat, Loading, Badge } from '../components/ui';
import { ROLE_LABEL, when, label } from '../api';

export default function AdminDashboard() {
  const stats = useApi('/admin/stats');
  const logs = useApi('/admin/audit-logs?limit=8');
  const branches = useApi('/branches');
  if (stats.loading && !stats.data) return <Loading />;
  const s = stats.data || {};
  return (
    <>
      <PageHead title="Admin dashboard" sub="System health, accounts and access control">
        <Link className="btn ghost" to="/app/branches">Add branch</Link>
        <Link className="btn" to="/app/users">Manage users</Link>
      </PageHead>
      <div className="stats">
        <Stat label="Active branches" value={s.branches} />
        <Stat label="Staff accounts" value={s.users} />
        <Stat label="Customer accounts" value={s.customers} />
        <Stat label="Menu items live" value={s.menu_items} />
        <Stat label="Orders today" value={s.orders_today} />
        <Stat label="Logins (24h)" value={s.logins_24h} hint={`${s.disabled_users} disabled accounts`} />
      </div>
      <div className="grid2">
        <Card title="Accounts by role">
          <table className="tbl"><tbody>
            {(s.users_by_role || []).map((r) => <tr key={r.role}><td><Badge v={r.role} text={ROLE_LABEL[r.role]} /></td><td className="r"><b>{r.count}</b></td></tr>)}
          </tbody></table>
        </Card>
        <Card title="Branches" action={<Link to="/app/branches" className="small">Manage →</Link>}>
          <table className="tbl"><thead><tr><th>Branch</th><th>City</th><th className="r">Staff</th><th>Status</th></tr></thead><tbody>
            {(branches.data || []).map((b) => <tr key={b.id}><td>{b.name}</td><td>{b.city}</td><td className="r">{b.staff_count}</td><td><Badge v={b.active ? 'paid' : 'cancelled'} text={b.active ? 'Open' : 'Closed'} /></td></tr>)}
          </tbody></table>
        </Card>
        <Card title="Recent activity" className="span2" action={<Link to="/app/audit" className="small">Full audit log →</Link>}>
          <table className="tbl"><thead><tr><th>When</th><th>User</th><th>Action</th><th>Record</th></tr></thead><tbody>
            {(logs.data || []).map((l) => <tr key={l.id}><td className="nowrap">{when(l.created_at)}</td><td>{l.user_name || 'Guest'} <small className="muted">{l.user_role ? ROLE_LABEL[l.user_role] : ''}</small></td><td>{label(l.action)}</td><td>{label(l.entity)} {l.entity_id ? `#${l.entity_id}` : ''}</td></tr>)}
          </tbody></table>
        </Card>
      </div>
    </>
  );
}
