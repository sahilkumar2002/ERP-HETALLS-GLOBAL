import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { DollarSign, FileText, TrendingUp, TrendingDown } from 'lucide-react'

export default function Accounts() {
  const { API } = useAuth()
  const [invoices, setInvoices] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/accounts/invoices`),
      axios.get(`${API}/api/accounts/expenses`)
    ]).then(([invRes, expRes]) => {
      setInvoices(invRes.data)
      setExpenses(expRes.data)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [API])

  const getInvoiceBadge = (status) => {
    return <span className={`badge badge-${status}`}>{status}</span>
  }

  const totalInvoices = invoices.reduce((acc, inv) => acc + inv.total, 0)
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0)
  const netIncome = totalInvoices - totalExpenses

  return (
    <div>
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Invoiced (Demo)</span>
            <div className="kpi-icon green"><TrendingUp size={18} /></div>
          </div>
          <div className="kpi-value text-success">${totalInvoices.toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Expenses (Demo)</span>
            <div className="kpi-icon red"><TrendingDown size={18} /></div>
          </div>
          <div className="kpi-value text-danger">${totalExpenses.toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Net Income (Demo)</span>
            <div className="kpi-icon gold"><DollarSign size={18} /></div>
          </div>
          <div className="kpi-value text-gold">${netIncome.toLocaleString()}</div>
        </div>
      </div>

      <div className="chart-grid">
        {/* Invoices */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Invoices</div>
              <div className="card-subtitle">Recent B2B and Wholesale Invoices</div>
            </div>
            <FileText size={20} className="text-muted" />
          </div>
          <div className="table-wrapper">
            {loading ? <div className="spinner" /> : (
              <table>
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th>Client</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.id}>
                      <td style={{ color: 'var(--gold)', fontFamily: 'monospace' }}>{inv.invoice_no}</td>
                      <td>{inv.client_name}</td>
                      <td style={{ fontWeight: 600 }}>${inv.total.toLocaleString()}</td>
                      <td>{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}</td>
                      <td>{getInvoiceBadge(inv.status)}</td>
                    </tr>
                  ))}
                  {invoices.length === 0 && <tr><td colSpan="5">No invoices found.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Expenses */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Expenses</div>
              <div className="card-subtitle">Recent operating expenses</div>
            </div>
            <TrendingDown size={20} className="text-muted" />
          </div>
          <div className="table-wrapper">
            {loading ? <div className="spinner" /> : (
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.slice(0, 15).map(exp => (
                    <tr key={exp.id}>
                      <td>{exp.title}</td>
                      <td><span className="badge" style={{ background: 'var(--bg-surface)' }}>{exp.category}</span></td>
                      <td>{exp.date ? new Date(exp.date).toLocaleDateString() : '—'}</td>
                      <td className="text-danger font-bold">${exp.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  {expenses.length === 0 && <tr><td colSpan="4">No expenses found.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
