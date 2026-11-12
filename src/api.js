// Thin fetch wrapper. Attaches the JWT and turns API errors into thrown Error objects.
const BASE = import.meta.env.VITE_API_URL || '';

export function getToken() { try { return localStorage.getItem('steakz_token'); } catch { return null; } }
export function setToken(t) { try { t ? localStorage.setItem('steakz_token', t) : localStorage.removeItem('steakz_token'); } catch { /* storage blocked */ } }

export async function api(path, { method = 'GET', body, raw } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (raw) return res;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status; err.fields = data.fields;
    if (res.status === 401 && token) { setToken(null); window.dispatchEvent(new Event('steakz:logout')); }
    throw err;
  }
  return data;
}

export const gbp = (n) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n || 0);
export const when = (s) => s ? new Date(s.replace(' ', 'T') + (s.includes('Z') ? '' : 'Z')).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
export const label = (s) => String(s || '').replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
export const ROLE_LABEL = {
  admin: 'Administrator', hq_manager: 'HQ Manager', branch_manager: 'Branch Manager', chef: 'Chef',
  cashier: 'Cashier / Waiter', delivery: 'Delivery Driver', customer: 'Customer',
};
export const LEVEL_LABEL = { 1: 'Level 1 · Admin', 2: 'Level 2 · Management', 3: 'Level 3 · Operations' };
