import { useAuth } from '../auth';
import Reports from './Reports';
import Kitchen from './Kitchen';
import Pos from './Pos';
import Deliveries from './Deliveries';
import AdminDashboard from './AdminDashboard';

// Landing screen after login depends on the role (and so on the access level).
export default function Dashboard() {
  const { user } = useAuth();
  switch (user.role) {
    case 'admin': return <AdminDashboard />;
    case 'hq_manager': return <Reports title="Group overview" />;
    case 'branch_manager': return <Reports title="Branch dashboard" />;
    case 'chef': return <Kitchen />;
    case 'cashier': return <Pos />;
    case 'delivery': return <Deliveries />;
    default: return <Pos customer />;
  }
}
