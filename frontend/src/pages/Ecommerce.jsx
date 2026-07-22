import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react'

export default function Ecommerce() {
  const { API } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState(null)
  const fileInputRef = useRef(null)
  
  const fetchOrders = () => {
    setLoading(true)
    axios.get(`${API}/api/orders`)
      .then(r => setOrders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchOrders()
  }, [API])

  const handleUpload = async (platform) => {
    const file = fileInputRef.current?.files[0]
    if (!file) return alert("Please select a file first")
    
    setUploading(true)
    setMsg(null)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('platform', platform)
    
    try {
      const res = await axios.post(`${API}/api/orders/upload-csv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMsg({ type: 'success', text: res.data.message })
      fetchOrders()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.detail || "Upload failed" })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const getStatusBadge = (status) => {
    return <span className={`badge badge-${status}`}>{status}</span>
  }

  return (
    <div>
      <div className="card mb-6">
        <div className="card-header">
          <div>
            <div className="card-title">Import Orders</div>
            <div className="card-subtitle">Upload CSV/TXT reports from Amazon Seller Central or Etsy</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".csv,.txt"
            className="form-input" 
            style={{ maxWidth: 300 }}
          />
          <button 
            className="btn-primary flex items-center justify-center gap-2" 
            style={{ width: 'auto', padding: '10px 20px', background: 'var(--gold)' }}
            onClick={() => handleUpload('amazon')}
            disabled={uploading}
          >
            <UploadCloud size={18} /> Import Amazon
          </button>
          <button 
            className="btn-primary flex items-center justify-center gap-2" 
            style={{ width: 'auto', padding: '10px 20px', background: '#f87171' }}
            onClick={() => handleUpload('etsy')}
            disabled={uploading}
          >
            <UploadCloud size={18} /> Import Etsy
          </button>
          {uploading && <span className="spinner" />}
        </div>
        {msg && (
          <div className={`mt-4 p-3 flex items-center gap-2 rounded ${msg.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`} style={{ border: `1px solid ${msg.type === 'success' ? 'var(--success)' : 'var(--danger)'}`, borderRadius: 'var(--radius-sm)' }}>
            {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-bold">{msg.text}</span>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">All Orders</div>
            <div className="card-subtitle">{orders.length} orders found</div>
          </div>
        </div>
        <div className="table-wrapper">
          {loading ? (
             <div className="page-loading" style={{ height: 100 }}><div className="spinner" /></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Platform</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ color: 'var(--gold)', fontFamily: 'monospace' }}>{o.order_id}</td>
                    <td><span className={`platform-pill ${o.platform}`}>{o.platform === 'amazon' ? '📦 Amazon' : '🛍 Etsy'}</span></td>
                    <td>{new Date(o.order_date).toLocaleDateString()}</td>
                    <td>{o.customer_name}</td>
                    <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.product_name}</td>
                    <td>{o.quantity}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 600 }}>${o.amount.toLocaleString()}</td>
                    <td>{getStatusBadge(o.status)}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>No orders found. Upload a CSV to get started.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
