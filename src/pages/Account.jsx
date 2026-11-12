import { useAuth } from '../auth';
import { api, ROLE_LABEL, LEVEL_LABEL } from '../api';
import { PageHead, Card, Field, useToast } from '../components/ui';

export default function Account() {
  const { user } = useAuth();
  const toast = useToast();
  const save = async (e) => {
    e.preventDefault();
    try { await api('/auth/me/password', { method: 'PATCH', body: Object.fromEntries(new FormData(e.target)) }); toast('Password changed'); e.target.reset(); }
    catch (x) { toast(x.message, 'bad'); }
  };
  return (
    <>
      <PageHead title="My account" />
      <div className="grid2">
        <Card title="Profile">
          <dl className="dl"><dt>Name</dt><dd>{user.name}</dd><dt>Email</dt><dd>{user.email}</dd><dt>Role</dt><dd>{ROLE_LABEL[user.role]}</dd>
            <dt>Access</dt><dd>{LEVEL_LABEL[user.access_level]}</dd>{user.branch_name && <><dt>Branch</dt><dd>{user.branch_name}</dd></>}</dl>
        </Card>
        <Card title="Change password">
          <form onSubmit={save} className="stack">
            <Field label="Current password"><input type="password" name="current_password" required /></Field>
            <Field label="New password" hint="At least 8 characters"><input type="password" name="new_password" minLength={8} required /></Field>
            <button className="btn">Update password</button>
          </form>
        </Card>
      </div>
    </>
  );
}
