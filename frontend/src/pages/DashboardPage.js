import React, { useState, useEffect, useCallback } from 'react';
import { productAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ProductModal from '../components/ProductModal';

/**
 * Main product dashboard – Amazon/Flipkart style product grid.
 * - All users can browse and search products.
 * - ADMIN users see Edit / Delete buttons on each card.
 * - ADMIN users see an "Add Product" button.
 */
const DashboardPage = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('');
  const [modalProduct, setModalProduct] = useState(undefined); // undefined = closed, null = new, obj = edit
  const [deleting, setDeleting] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await productAPI.getAll();
      setProducts(data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) { loadProducts(); return; }
    setLoading(true);
    try {
      const { data } = await productAPI.search(search.trim());
      setProducts(data);
    } catch {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This action cannot be undone.')) return;
    setDeleting(id);
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  // Local category filter
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const displayed  = category
    ? products.filter(p => p.category === category)
    : products;

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">🛍 Product Dashboard</h1>
          <p className="page-subtitle">{products.length} products available</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <form className="search-bar" onSubmit={handleSearch}>
            <input className="form-input" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products…" />
            <button type="submit" className="btn btn-primary btn-sm">Search</button>
            {search && (
              <button type="button" className="btn btn-ghost btn-sm"
                onClick={() => { setSearch(''); loadProducts(); }}>Clear</button>
            )}
          </form>
          {/* Admin: Add Product */}
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setModalProduct(null)}>
              + Add Product
            </button>
          )}
        </div>
      </div>

      {/* Category filter chips */}
      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <button className={`btn btn-sm ${!category ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setCategory('')}>All</button>
          {categories.map(cat => (
            <button key={cat}
              className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setCategory(cat)}>{cat}</button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && <div className="spinner" />}

      {/* Empty state */}
      {!loading && displayed.length === 0 && (
        <div className="empty-state">
          <div className="icon">📦</div>
          <h3>No products found</h3>
          <p>Try a different search term or category.</p>
        </div>
      )}

      {/* Products grid */}
      {!loading && displayed.length > 0 && (
        <div className="products-grid">
          {displayed.map(product => (
            <div className="product-card" key={product.id}>
              <img
                className="product-image"
                src={product.imageUrl || `https://placehold.co/400x200?text=${encodeURIComponent(product.name)}`}
                alt={product.name}
                onError={e => { e.target.src = `https://placehold.co/400x200?text=Product`; }}
              />
              <div className="product-info">
                {product.category && (
                  <div className="product-category">{product.category}</div>
                )}
                <div className="product-name">{product.name}</div>
                <div className="product-desc">{product.description || 'No description available.'}</div>
                <div className="product-footer">
                  <span className="product-price">₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  <span className="product-stock">
                    {product.stock > 0 ? `${product.stock} in stock` : '❌ Out of stock'}
                  </span>
                </div>
                {/* Admin actions */}
                {isAdmin && (
                  <div className="product-actions">
                    <button className="btn btn-outline btn-sm" style={{ flex: 1 }}
                      onClick={() => setModalProduct(product)}>✏️ Edit</button>
                    <button className="btn btn-danger btn-sm" style={{ flex: 1 }}
                      onClick={() => handleDelete(product.id)}
                      disabled={deleting === product.id}>
                      {deleting === product.id ? '…' : '🗑 Delete'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Modal (Admin only) */}
      {modalProduct !== undefined && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(undefined)}
          onSaved={() => { setModalProduct(undefined); loadProducts(); }}
        />
      )}
    </div>
  );
};

export default DashboardPage;
