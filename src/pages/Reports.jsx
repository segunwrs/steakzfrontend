import { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { useAuth } from '../auth';
import { api, gbp, label } from '../api';
import { useApi, PageHead, Card, Stat, Loading, ErrorBox, Badge } from '../components/ui';

const ACCENT = '#b4321f';
const ACCENT2 = '#3b5b7a';

// Management reporting: HQ sees the whole group and can drill into a branch; a branch manager sees only their branch.
export default function Reports({ title = 'Reports' }) {
  const { user } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(new Date(Date.now() - 29 * 864e5).toISOString().slice(0, 10));
  const [to, setTo] = useState(today);
  const [branch, setBranch] = useState('');
  const global = ['admin', 'hq_manager'].includes(user.role);
  const branches = useApi(global ? '/branches' : null);
  const q = `?from=${from}&to=${to}${branch ? `&branch_id=${branch}` : ''}`;
  const { data, loading, error } = useApi(`/reports/summary${q}`);

  const exportCsv = async () => {
    const res = await api(`/reports/sales.csv${q}`, { raw: true });
    const blob = await res.blob();
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `steakz-sales-${from}-to-${to}.csv` });
    a.click();
  };

  return (
    <>
      <PageHead title={title} sub={global ? 'Sales, stock and bookings across all Steakz branches' : `Performance for ${user.branch_name}`}>
        {global && (
          <select value={branch} onChange={(e) => setBranch(e.target.value)} aria-label="Branch">
            <option value="">All branches</option>{(branches.data || []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
        <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} aria-label="From" />
        <input type="date" value={to} min={from} max={today} onChange={(e) => setTo(e.target.value)} aria-label="To" />
        <button className="btn ghost" onClick={exportCsv}>Export CSV</button>
      </PageHead>
      <ErrorBox error={error} />
      {loading && !data ? <Loading /> : data && (
        <>
          <div className="stats">
            <Stat label="Revenue" value={gbp(data.kpi.revenue)} hint={`${from} → ${to}`} />
            <Stat label="Orders" value={data.kpi.orders} hint={`${data.kpi.open_orders || 0} open now`} />
            <Stat label="Average order" value={gbp(data.kpi.avg_order_value)} />
            <Stat label="Cancelled" value={`${data.kpi.orders ? ((data.kpi.cancelled / data.kpi.orders) * 100).toFixed(1) : 0}%`} hint={`${data.kpi.cancelled} orders`} tone={data.kpi.cancelled / (data.kpi.orders || 1) > 0.05 ? 'warn' : ''} />
            <Stat label="Upcoming bookings" value={data.reservations.upcoming} hint={`${data.reservations.covers} covers`} />
            <Stat label="Low-stock items" value={data.lowStock.length} tone={data.lowStock.length ? 'warn' : ''} hint="at or below reorder level" />
          </div>

          <div className="grid2">
            <Card title="Daily revenue" className="span2">
              <div className="chart"><ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.byDay} margin={{ left: 8, right: 8, top: 8 }}>
                  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={ACCENT} stopOpacity={0.25} /><stop offset="1" stopColor={ACCENT} stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid stroke="#eee6dc" vertical={false} />
                  <XAxis dataKey="day" tickFormatter={(d) => d.slice(5)} tick={{ fontSize: 11 }} stroke="#9a8f84" />
                  <YAxis tickFormatter={(v) => `£${Math.round(v / 100) / 10}k`} tick={{ fontSize: 11 }} stroke="#9a8f84" width={48} />
                  <Tooltip formatter={(v) => gbp(v)} />
                  <Area type="monotone" dataKey="revenue" stroke={ACCENT} strokeWidth={2} fill="url(#g)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer></div>
            </Card>

            {data.byBranch.length > 0 && (
              <Card title="Branch comparison">
                <table className="tbl"><thead><tr><th>Branch</th><th className="r">Orders</th><th className="r">Avg</th><th className="r">Revenue</th></tr></thead>
                  <tbody>{data.byBranch.map((b) => <tr key={b.id}><td>{b.name}</td><td className="r">{b.orders}</td><td className="r">{gbp(b.avg_order_value)}</td><td className="r"><b>{gbp(b.revenue)}</b></td></tr>)}</tbody>
                </table>
              </Card>
            )}

            <Card title="Top-selling items">
              <table className="tbl"><thead><tr><th>Item</th><th className="r">Sold</th><th className="r">Revenue</th></tr></thead>
                <tbody>{data.topItems.map((t) => <tr key={t.name}><td>{t.name} <small className="muted">{t.category}</small></td><td className="r">{t.qty}</td><td className="r">{gbp(t.revenue)}</td></tr>)}</tbody>
              </table>
            </Card>

            <Card title="Orders by hour (staffing)">
              <div className="chart"><ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.byHour}><CartesianGrid stroke="#eee6dc" vertical={false} />
                  <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} tick={{ fontSize: 11 }} stroke="#9a8f84" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9a8f84" width={36} /><Tooltip labelFormatter={(h) => `${h}:00`} />
                  <Bar dataKey="orders" fill={ACCENT2} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer></div>
            </Card>

            <Card title="Sales channel">
              <table className="tbl"><thead><tr><th>Channel</th><th className="r">Orders</th><th className="r">Revenue</th></tr></thead>
                <tbody>{data.byType.map((t) => <tr key={t.type}><td>{label(t.type)}</td><td className="r">{t.orders}</td><td className="r">{gbp(t.revenue)}</td></tr>)}</tbody>
              </table>
            </Card>

            <Card title="Stock alerts">
              {data.lowStock.length === 0 ? <p className="muted">All stock above reorder levels.</p> : (
                <table className="tbl"><thead><tr><th>Item</th>{global && !branch && <th>Branch</th>}<th className="r">On hand</th><th className="r">Reorder at</th></tr></thead>
                  <tbody>{data.lowStock.map((s) => <tr key={s.id}><td><Badge v="unpaid" text="Low" /> {s.name}</td>{global && !branch && <td>{s.branch_name.replace('Steakz ', '')}</td>}<td className="r">{s.quantity} {s.unit}</td><td className="r">{s.reorder_level}</td></tr>)}</tbody>
                </table>
              )}
            </Card>
          </div>
        </>
      )}
    </>
  );
}
