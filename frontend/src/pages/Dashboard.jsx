import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import {
  DollarSign, ShoppingCart, Package, AlertTriangle,
  TrendingUp, Users, FileText, AlertCircle
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

// ── Custom Tooltip ────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontSize: 13
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: ${p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

// ── KPI Card ──────────────────────────────────────────────────────────
function KPICard({ icon: Icon, label, value, sub, colorClass, prefix = '', format = 'number' }) {
  const display = format === 'currency'
    ? `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 0 })}`
    : Number(value).toLocaleString()
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-label">{label}</span>
        <div className={`kpi-icon ${colorClass}`}><Icon size={18} /></div>
      </div>
      <div className="kpi-value">{display}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  )
}

// ── Status Badge ──────────────────────────────────────────────────────
function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>
}
function PlatformPill({ platform }) {
  return <span className={`platform-pill ${platform}`}>{platform === 'amazon' ? '📦 Amazon' : '🛍 Etsy'}</span>
}

// ── Dashboard Page ────────────────────────────────────────────────────
export default function Dashboard() {
  const { API } = useAuth()
  const [kpis,         setKpis]         = useState(null)
  const [revenueChart, setRevenueChart] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [platformSplit,setPlatformSplit] = useState([])
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/dashboard/kpis`),
      axios.get(`${API}/api/dashboard/revenue-chart`),
      axios.get(`${API}/api/dashboard/recent-orders`),
      axios.get(`${API}/api/dashboard/platform-split`),
    ]).then(([k, r, o, p]) => {
      setKpis(k.data)
      setRevenueChart(r.data)
      setRecentOrders(o.data)
      setPlatformSplit(p.data)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [API])

  if (loading) return (
    <div className="page-loading">
      <div className="big-spinner" />
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading dashboard…</p>
    </div>
  )

  return (
    <div>
      {/* KPI Grid */}
      <div className="kpi-grid">
        <KPICard icon={DollarSign}    label="Total Revenue"      value={kpis?.total_revenue}     sub="All time, USD"           colorClass="gold"  format="currency" />
        <KPICard icon={TrendingUp}    label="Monthly Revenue"    value={kpis?.monthly_revenue}   sub="This month"              colorClass="green" format="currency" />
        <KPICard icon={ShoppingCart}  label="Total Orders"       value={kpis?.total_orders}      sub={`${kpis?.pending_orders} pending`} colorClass="blue" />
        <KPICard icon={Package}       label="Low Stock Alerts"   value={kpis?.low_stock_alerts}  sub="Products below reorder"  colorClass="red" />
        <KPICard icon={FileText}      label="Pending Invoices"   value={kpis?.pending_invoices}  sub={`${kpis?.overdue_invoices} overdue`} colorClass="gold" format="currency" />
        <KPICard icon={Users}         label="Active Employees"   value={kpis?.total_employees}   sub="Across all departments"  colorClass="blue" />
      </div>

      {/* Charts */}
      <div className="chart-grid">
        {/* Revenue Area Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Revenue Trend</div>
              <div className="card-subtitle">Amazon FBA vs Etsy — last 6 months</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueChart} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="amazon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="etsy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f87171" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="amazon" name="Amazon FBA" stroke="#f59e0b" strokeWidth={2} fill="url(#amazon)" />
              <Area type="monotone" dataKey="etsy"   name="Etsy"       stroke="#f87171" strokeWidth={2} fill="url(#etsy)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Split Pie */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Platform Split</div>
              <div className="card-subtitle">Revenue by channel</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={platformSplit}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {platformSplit.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, '']} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          {platformSplit.length === 2 && (
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 8 }}>
              {platformSplit.map(p => {
                const total = platformSplit.reduce((a, b) => a + b.value, 0)
                const pct   = total ? ((p.value / total) * 100).toFixed(1) : 0
                return (
                  <div key={p.name} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: p.color }}>{pct}%</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.name}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Recent Orders</div>
            <div className="card-subtitle">Latest 8 orders across all platforms</div>
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Platform</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id}>
                  <td style={{ color: 'var(--gold)', fontFamily: 'monospace', fontSize: 12 }}>{o.order_id}</td>
                  <td><PlatformPill platform={o.platform} /></td>
                  <td>{o.customer_name}</td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.product_name}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 600 }}>${o.amount?.toLocaleString()}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td style={{ fontSize: 12 }}>{o.order_date ? new Date(o.order_date).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
