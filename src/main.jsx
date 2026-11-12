import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles.css';
import { AuthProvider, useAuth } from './auth';
import { ToastProvider, Loading } from './components/ui';
import Layout from './components/Layout';
import Home from './pages/Home';
import { Login, Register } from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Orders from './pages/Orders';
import Pos from './pages/Pos';
import Kitchen from './pages/Kitchen';
import Inventory from './pages/Inventory';
import Reservations from './pages/Reservations';
import Users from './pages/Users';
import Branches from './pages/Branches';
import MenuAdmin from './pages/MenuAdmin';
import AuditLog from './pages/AuditLog';
import Account from './pages/Account';

// Route guard: needs login, and optionally one of the listed roles.
function Guard({ roles, children }) {
  const { user, ready } = useAuth();
  if (!ready) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <div className="content"><div className="alert">403 — your role does not have access to this page.</div></div>;
  return children;
}

const M = ['admin', 'hq_manager', 'branch_manager'];

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/app" element={<Guard><Layout /></Guard>}>
        <Route index element={<Dashboard />} />
        <Route path="reports" element={<Guard roles={M}><Reports /></Guard>} />
        <Route path="orders" element={<Guard roles={[...M, 'cashier', 'customer']}><Orders /></Guard>} />
        <Route path="pos" element={<Guard roles={['admin', 'branch_manager', 'cashier']}><Pos /></Guard>} />
        <Route path="kitchen" element={<Guard roles={['admin', 'branch_manager', 'chef']}><Kitchen /></Guard>} />
        <Route path="inventory" element={<Guard roles={[...M, 'chef']}><Inventory /></Guard>} />
        <Route path="reservations" element={<Guard roles={['admin', 'hq_manager', 'branch_manager', 'cashier', 'customer']}><Reservations /></Guard>} />
        <Route path="users" element={<Guard roles={M}><Users /></Guard>} />
        <Route path="branches" element={<Guard roles={['admin', 'hq_manager']}><Branches /></Guard>} />
        <Route path="menu" element={<Guard roles={['admin', 'hq_manager', 'chef']}><MenuAdmin /></Guard>} />
        <Route path="audit" element={<Guard roles={['admin']}><AuditLog /></Guard>} />
        <Route path="account" element={<Account />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter><AuthProvider><ToastProvider><App /></ToastProvider></AuthProvider></BrowserRouter>
  </React.StrictMode>,
);
