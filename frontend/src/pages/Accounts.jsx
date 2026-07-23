import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { DollarSign, FileText, TrendingUp, TrendingDown } from 'lucide-react'

export default function Accounts() {
  const { API } = useAuth()
  const [invoices, setInvoices] = useState([])
  const [expenses, setExpenses] = useState([])
  const [billsLinks, setBillsLinks] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/accounts/invoices`),
      axios.get(`${API}/api/accounts/expenses`),
      axios.get(`${API}/api/accounts/bills-links`)
    ]).then(([invRes, expRes, billsRes]) => {
      setInvoices(invRes.data)
      setExpenses(expRes.data)
      setBillsLinks(billsRes.data)
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
      <div className="chart-grid">
        {/* Company Bills */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Company Bills</div>
              <div className="card-subtitle">Auto-synced from Google Sheets</div>
            </div>
            <FileText size={20} className="text-muted" />
          </div>
          <div className="card-body" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {loading ? <div className="spinner" /> : (
              <>
                {billsLinks?.HG && (
                  <a href={billsLinks.HG} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ flex: '1 1 calc(25% - 1rem)', textAlign: 'center' }}>
                    HG Bill
                  </a>
                )}
                {billsLinks?.MMC && (
                  <a href={billsLinks.MMC} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ flex: '1 1 calc(25% - 1rem)', textAlign: 'center' }}>
                    MMC Bill
                  </a>
                )}
                {billsLinks?.HO && (
                  <a href={billsLinks.HO} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ flex: '1 1 calc(25% - 1rem)', textAlign: 'center' }}>
                    HO Bill
                  </a>
                )}
                {billsLinks?.MKM && (
                  <a href={billsLinks.MKM} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ flex: '1 1 calc(25% - 1rem)', textAlign: 'center' }}>
                    MKM Bill
                  </a>
                )}
                {(!billsLinks?.HG && !billsLinks?.MMC && !billsLinks?.HO && !billsLinks?.MKM) && (
                  <p className="text-muted">No links found or failed to load.</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
