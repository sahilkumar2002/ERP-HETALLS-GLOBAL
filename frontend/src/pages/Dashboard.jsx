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
  const [companiesRev, setCompaniesRev] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [showRevDrop,  setShowRevDrop]  = useState(false)
  const [cubeSide,     setCubeSide]     = useState(0)

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/dashboard/kpis`),
      axios.get(`${API}/api/dashboard/revenue-chart`),
      axios.get(`${API}/api/dashboard/recent-orders`),
      axios.get(`${API}/api/dashboard/companies-revenue`),
    ]).then(([k, r, o, c]) => {
      setKpis(k.data)
      setRevenueChart(r.data)
      setRecentOrders(o.data)
      setCompaniesRev(c.data)
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
        <div style={{ position: 'relative' }}>
          <div onClick={() => setShowRevDrop(!showRevDrop)} style={{ cursor: 'pointer' }}>
            <KPICard icon={DollarSign} label="Total Revenue (Click Me)" value={kpis?.total_revenue} sub="Monthly Brands, USD" colorClass="gold" format="currency" />
          </div>
          {showRevDrop && (
            <div style={{
              position: 'absolute', top: '105%', left: 0, width: '100%', zIndex: 10,
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px',
              padding: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>Companies Revenue:</div>
              {companiesRev.map(c => (
                <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                  <span style={{ color: c.color }}>{c.name}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text)' }}>${c.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* The 5-Sided 3D Prism */}
        <div className="cube-container" onClick={() => setCubeSide(s => s + 1)} style={{ cursor: 'pointer' }}>
          <div className="cube" style={{ transform: `translateZ(-83px) rotateX(${cubeSide * 72}deg)` }}>
            <div className="cube-face">
              <div style={{ width: '100%', height: '100%' }}><KPICard icon={Package} label="Orders Overview" value="Click to Spin" sub="View detailed stats" colorClass="blue" format="text" /></div>
            </div>
            <div className="cube-face">
              <div style={{ width: '100%', height: '100%' }}><KPICard icon={ShoppingCart} label="Total Orders" value={kpis?.total_orders} sub="All time" colorClass="info" /></div>
            </div>
            <div className="cube-face">
              <div style={{ width: '100%', height: '100%' }}><KPICard icon={TrendingUp} label="Orders This Year" value={kpis?.this_year_orders} sub="Year to date" colorClass="success" /></div>
            </div>
            <div className="cube-face">
              <div style={{ width: '100%', height: '100%' }}><KPICard icon={TrendingUp} label="Orders This Month" value={kpis?.this_month_orders} sub="Month to date" colorClass="warning" /></div>
            </div>
            <div className="cube-face">
              <div style={{ width: '100%', height: '100%' }}><KPICard icon={AlertCircle} label="Orders Today" value={kpis?.today_orders} sub="Today's orders" colorClass="danger" /></div>
            </div>
          </div>
        </div>

        {/* Active Employees */}
        <KPICard icon={Users} label="Active Employees" value={kpis?.total_employees || 42} sub="Across all departments" colorClass="green" />
      </div>

      {/* Charts */}
      <div className="chart-grid" style={{ gridTemplateColumns: '1fr' }}>
        {/* Revenue Area Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Monthly Revenue Trend</div>
              <div className="card-subtitle">All Companies — Monthly Brands</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={revenueChart} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              
              <Bar dataKey="ETSY-CASAVANI" name="Etsy-Casavani" fill="#f87171" stackId="a" />
              <Bar dataKey="AMAZON" name="Amazon" fill="#f59e0b" stackId="a" />
              <Bar dataKey="ETSY-RUGSFOREVER" name="Etsy-Rugsforever" fill="#fb923c" stackId="a" />
              <Bar dataKey="WALMART" name="Walmart" fill="#3b82f6" stackId="a" />
              <Bar dataKey="PEPPERFRY" name="Pepperfry" fill="#ef4444" stackId="a" />
              <Bar dataKey="CASAVANI WEBSITE" name="Casavani Website" fill="#10b981" stackId="a" />
              <Bar dataKey="EBAY-RUGSFOREVER" name="Ebay-Rugsforever" fill="#8b5cf6" stackId="a" />
              <Bar dataKey="JAYPOR" name="Jaypor" fill="#ec4899" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>


    </div>
  )
}
