import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Check, Edit2, AlertTriangle } from 'lucide-react'

export default function Inventory() {
  const { API } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editStock, setEditStock] = useState(0)

  const fetchInventory = () => {
    setLoading(true)
    axios.get(`${API}/api/inventory`)
      .then(r => setProducts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchInventory()
  }, [API])

  const handleEdit = (p) => {
    setEditingId(p.id)
    setEditStock(p.stock_qty)
  }

  const handleSave = async (id) => {
    try {
      await axios.put(`${API}/api/inventory/${id}/stock`, { stock_qty: parseInt(editStock, 10) || 0 })
      setEditingId(null)
      fetchInventory()
    } catch (err) {
      alert("Failed to update stock")
    }
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Product Catalog & Inventory</div>
            <div className="card-subtitle">{products.length} products total</div>
          </div>
        </div>
        <div className="table-wrapper">
          {loading ? (
             <div className="page-loading" style={{ height: 100 }}><div className="spinner" /></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Size</th>
                  <th>Color</th>
                  <th>Location</th>
                  <th>Cost / Sell</th>
                  <th>Stock Qty</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const isLowStock = p.stock_qty <= p.reorder_level
                  return (
                    <tr key={p.id}>
                      <td style={{ color: 'var(--gold)', fontFamily: 'monospace', fontWeight: 600 }}>{p.sku}</td>
                      <td>{p.name}</td>
                      <td>{p.category}</td>
                      <td>{p.size}</td>
                      <td>{p.color}</td>
                      <td><span className="badge badge-paid" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--info)' }}>{p.location}</span></td>
                      <td style={{ color: 'var(--success)' }}>${p.cost_price} / ${p.sell_price}</td>
                      <td>
                        {editingId === p.id ? (
                          <input 
                            type="number" 
                            className="form-input" 
                            style={{ width: 80, padding: '4px 8px' }}
                            value={editStock}
                            onChange={(e) => setEditStock(e.target.value)}
                            autoFocus
                          />
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: isLowStock ? 'var(--danger)' : 'inherit' }}>
                            {p.stock_qty}
                            {isLowStock && <AlertTriangle size={14} title="Low Stock!" />}
                          </span>
                        )}
                      </td>
                      <td>
                        {editingId === p.id ? (
                          <button onClick={() => handleSave(p.id)} className="btn-primary" style={{ padding: '6px 12px', width: 'auto' }}>
                            <Check size={14} />
                          </button>
                        ) : (
                          <button onClick={() => handleEdit(p)} style={{ background: 'none', color: 'var(--gold)' }}>
                            <Edit2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '30px' }}>No products found.</td>
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
