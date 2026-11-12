import { useState } from 'react';
import { ROLE_LABEL, when, label } from '../api';
import { useApi, PageHead, Card, Loading } from '../components/ui';

export default function AuditLog() {
  const [entity, setEntity] = useState('');
  const { data, loading } = useApi(`/admin/audit-logs?limit=300${entity ? `&entity=${entity}` : ''}`);
  return (
    <>
      <PageHead title="Audit log" sub="Who did what, and when — supports UK GDPR accountability">
        <select value={entity} onChange={(e) => setEntity(e.target.value)} aria-label="Record type">
          <option value="">All records</option>{['user', 'branch', 'order', 'menu_item', 'inventory', 'reservation'].map((x) => <option key={x} value={x}>{label(x)}</option>)}
        </select>
      </PageHead>
      <Card>
        {loading && !data ? <Loading /> : (
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>When</th><th>User</th><th>Action</th><th>Record</th><th>Details</th></tr></thead>
            <tbody>{(data || []).map((l) => (
              <tr key={l.id}><td className="nowrap">{when(l.created_at)}</td><td>{l.user_name || 'Guest'} <small className="muted">{l.user_role ? ROLE_LABEL[l.user_role] : ''}</small></td>
                <td>{label(l.action)}</td><td>{label(l.entity)} {l.entity_id ? `#${l.entity_id}` : ''}</td><td className="mono clip">{l.details}</td></tr>))}
            </tbody>
          </table></div>
        )}
      </Card>
    </>
  );
}
