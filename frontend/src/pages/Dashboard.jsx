import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import {
  DollarSign, ShoppingCart, Package, AlertTriangle,
  TrendingUp, Users, FileText, AlertCircle, Layers, X, Calendar, Clock, List
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
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [bdTab,        setBdTab]        = useState('today')
  const [bdCustomDate, setBdCustomDate] = useState('')
  const [bdData,       setBdData]       = useState(null)
  const [bdLoading,    setBdLoading]    = useState(false)

  const fetchBreakdown = (dateParam) => {
    setBdLoading(true)
    axios.get(`${API}/api/breakdown/daily-sales?date=${dateParam}`)
      .then(res => setBdData(res.data))
      .catch(console.error)
      .finally(() => setBdLoading(false))
  }

  const openBreakdown = () => {
    setShowBreakdown(true)
    setBdTab('today')
    fetchBreakdown('today')
  }

  const handleBdTab = (tab) => {
    setBdTab(tab)
    if (tab === 'today') fetchBreakdown('today')
    else if (tab === 'all') fetchBreakdown('all')
  }

  const handleBdCustom = () => {
    if (bdCustomDate) { setBdTab('custom'); fetchBreakdown(bdCustomDate) }
  }

  const getGroupedData = () => {
    if (!bdData?.headers || !bdData?.sub_headers) return []
    const groups = []; let cur = null
    for (let i = 0; i < bdData.sub_headers.length; i++) {
      const h = bdData.headers[i] || '', s = bdData.sub_headers[i] || ''
      if (!cur || cur.header !== h) { cur = { header: h, columns: [] }; groups.push(cur) }
      cur.columns.push({ subHeader: s, colIndex: i })
    }
    return groups
  }

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
        
        {/* The 4-Sided Horizontal 3D Prism */}
        <div className="cube-container" onClick={() => setCubeSide(s => s + 1)} style={{ cursor: 'pointer' }}>
          <div className="cube" style={{ transform: `translateZ(-140px) rotateY(${cubeSide * -90}deg)` }}>
            {/* Face 1: Today */}
            <div className="cube-face">
              <div style={{ width: '100%', height: '100%' }}><KPICard icon={AlertCircle} label="Orders Today" value={kpis?.today_orders} sub="Click to spin" colorClass="danger" /></div>
            </div>
            {/* Face 2: Total */}
            <div className="cube-face">
              <div style={{ width: '100%', height: '100%' }}><KPICard icon={ShoppingCart} label="Total Orders" value={kpis?.total_orders} sub="All time" colorClass="info" /></div>
            </div>
            {/* Face 3: This Year */}
            <div className="cube-face">
              <div style={{ width: '100%', height: '100%' }}><KPICard icon={TrendingUp} label="Orders This Year" value={kpis?.this_year_orders} sub="Year to date" colorClass="success" /></div>
            </div>
            {/* Face 4: This Month */}
            <div className="cube-face">
              <div style={{ width: '100%', height: '100%' }}><KPICard icon={TrendingUp} label="Orders This Month" value={kpis?.this_month_orders} sub="Month to date" colorClass="warning" /></div>
            </div>
          </div>
        </div>

        {/* Active Employees */}
        <KPICard icon={Users} label="Active Employees" value={kpis?.total_employees || 42} sub="Across all departments" colorClass="green" />

        {/* Detailed Breakdown */}
        <div onClick={openBreakdown} style={{ cursor: 'pointer' }}>
          <KPICard icon={Layers} label="Detailed Breakdown" value="Click" sub="Daily Sale Brands & Portal" colorClass="blue" format="text" />
        </div>
      </div>

      {/* Breakdown Modal */}
      {showBreakdown && (
        <div className="breakdown-overlay" onClick={() => setShowBreakdown(false)}>
          <div className="breakdown-modal" onClick={e => e.stopPropagation()}>
            <div className="breakdown-modal-header">
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Daily Sale Brands & Portal</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {bdTab === 'today' && `Today — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  {bdTab === 'all' && 'All Data'}
                  {bdTab === 'custom' && `Custom — ${bdCustomDate}`}
                </p>
              </div>
              <button onClick={() => setShowBreakdown(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div className="breakdown-tabs">
              <button className={`breakdown-tab ${bdTab === 'today' ? 'active' : ''}`} onClick={() => handleBdTab('today')}><Clock size={14} /> Today</button>
              <button className={`breakdown-tab ${bdTab === 'all' ? 'active' : ''}`} onClick={() => handleBdTab('all')}><List size={14} /> All</button>
              <div className="breakdown-tab-custom">
                <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                <input type="date" value={bdCustomDate} onChange={e => setBdCustomDate(e.target.value)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 10px', color: 'var(--text-primary)', fontSize: '12px' }} />
                <button className={`breakdown-tab ${bdTab === 'custom' ? 'active' : ''}`} onClick={handleBdCustom}>Go</button>
              </div>
            </div>
            <div className="breakdown-content">
              {bdLoading ? (
                <div className="page-loading" style={{ height: '200px' }}><div className="big-spinner" /><p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Fetching data…</p></div>
              ) : !bdData || bdData.total_rows === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>No data found</p>
                  <p style={{ fontSize: '13px' }}>Try selecting a different date or view all data.</p>
                </div>
              ) : (
                bdData.rows.map((row, rowIdx) => (
                  <div key={rowIdx} className="breakdown-row-card">
                    <div className="breakdown-row-date">{row[0] || `Row ${rowIdx + 1}`}</div>
                    <div className="breakdown-groups">
                      {getGroupedData().map((group, gIdx) => {
                        const hasValues = group.columns.some(c => row[c.colIndex] && row[c.colIndex].trim())
                        if (!hasValues && gIdx > 0) return null
                        return (
                          <div key={gIdx} className="breakdown-group">
                            <div className="breakdown-group-header">{group.header}</div>
                            <div className="breakdown-group-items">
                              {group.columns.map((col, cIdx) => {
                                const val = row[col.colIndex] || ''
                                if (!val.trim() && gIdx > 0) return null
                                return (
                                  <div key={cIdx} className="breakdown-item">
                                    <span className="breakdown-item-label">{col.subHeader}</span>
                                    <span className="breakdown-item-value">{val.trim() || '—'}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

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
