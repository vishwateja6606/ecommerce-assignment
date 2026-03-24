import React, { useState, useEffect, useCallback } from 'react';
import { productAPI, userAPI } from '../api';
import { toast } from 'react-toastify';
import ProductModal from '../components/ProductModal';

/**
 * Admin-only management panel showing:
 *  - Tabbed view: Products | Users
 *  - Full CRUD table for Products
 *  - Read-only user list with roles
 */
const AdminPage = () => {
  const [tab,      setTab]      = useState('products');
  const [products, setProducts] = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(undefined);
  const [deleting, setDeleting] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await productAPI.getAll();
      setProducts(data);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userAPI.getAllUsers();
      setUsers(data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (tab === 'products') loadProducts();
    else loadUsers();
  }, [tab, loadProducts, loadUsers]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    setDeleting(id);
    try {
      await productAPI.delete(id);
      toast.success('Deleted');
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const stats = {
    totalProducts: products.length,
    totalStock:    products.reduce((s, p) => s + (p.stock || 0), 0),
    avgPrice:      products.length ? (products.reduce((s, p) => s + Number(p.price), 0) / products.length).toFixed(2) : '0.00',
    totalUsers:    users.length,
  };

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Admin Panel</h1>
          <p className="page-subtitle">Manage products and users</p>
        </div>
        {tab === 'products' && (
          <button className="btn btn-primary" onClick={() => setModal(null)}>+ Add Product</button>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Products', value: stats.totalProducts, icon: '📦' },
          { label: 'Total Stock',    value: stats.totalStock,    icon: '🏬' },
          { label: 'Avg. Price',     value: `₹${stats.avgPrice}`,icon: '💰' },
          { label: 'Total Users',    value: stats.totalUsers,    icon: '👥' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.25rem 0' }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['products', 'users'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}>
            {t === 'products' ? '📦 Products' : '👥 Users'}
          </button>
        ))}
      </div>

      <div className="card">
        {loading
          ? <div className="spinner" />
          : (
            <>
              {/* ── Products Table ── */}
              {tab === 'products' && (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id}>
                          <td style={{ color: 'var(--text-muted)' }}>#{p.id}</td>
                          <td>
                            <img src={p.imageUrl || 'https://placehold.co/40x40'}
                              alt={p.name}
                              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '0.35rem' }}
                              onError={e => { e.target.src = 'https://placehold.co/40x40'; }} />
                          </td>
                          <td style={{ fontWeight: 600, maxWidth: 200 }}>
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                          </td>
                          <td>{p.category || '—'}</td>
                          <td>₹{Number(p.price).toLocaleString('en-IN')}</td>
                          <td>
                            <span style={{ color: p.stock > 10 ? 'var(--success)' : p.stock > 0 ? 'var(--accent)' : 'var(--danger)', fontWeight: 600 }}>
                              {p.stock}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button className="btn btn-outline btn-sm" onClick={() => setModal(p)}>Edit</button>
                              <button className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(p.id)}
                                disabled={deleting === p.id}>
                                {deleting === p.id ? '…' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {products.length === 0 && (
                    <div className="empty-state"><div className="icon">📦</div><h3>No products yet</h3></div>
                  )}
                </div>
              )}

              {/* ── Users Table ── */}
              {tab === 'users' && (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr><th>ID</th><th>Username</th><th>Email</th><th>Full Name</th><th>Role</th><th>Provider</th></tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id}>
                          <td style={{ color: 'var(--text-muted)' }}>#{u.id}</td>
                          <td style={{ fontWeight: 600 }}>{u.username}</td>
                          <td>{u.email}</td>
                          <td>{u.fullName || '—'}</td>
                          <td>
                            <span className={`badge ${u.role === 'ROLE_ADMIN' ? 'admin' : ''}`}>
                              {u.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td style={{ textTransform: 'capitalize' }}>{u.provider || 'local'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <div className="empty-state"><div className="icon">👥</div><h3>No users yet</h3></div>
                  )}
                </div>
              )}
            </>
          )}
      </div>

      {modal !== undefined && (
        <ProductModal
          product={modal}
          onClose={() => setModal(undefined)}
          onSaved={() => { setModal(undefined); loadProducts(); }}
        />
      )}
    </div>
  );
};

export default AdminPage;
