import React, { useState, useEffect } from 'react';
import { productAPI } from '../api';
import { toast } from 'react-toastify';

/**
 * Modal form for creating or editing a product.
 * Shown only to ADMIN users from the admin panel.
 */
const ProductModal = ({ product, onClose, onSaved }) => {
  const isEditing = !!product;

  const [form, setForm] = useState({
    name:        product?.name        || '',
    description: product?.description || '',
    price:       product?.price       || '',
    stock:       product?.stock       || '',
    category:    product?.category    || '',
    imageUrl:    product?.imageUrl    || '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
      };
      if (isEditing) {
        await productAPI.update(product.id, payload);
        toast.success('Product updated!');
      } else {
        await productAPI.create(payload);
        toast.success('Product created!');
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  // Close on Esc key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input name="name" className="form-input" value={form.name}
                onChange={handleChange} required maxLength={200} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-input" value={form.description}
                onChange={handleChange} rows={3} maxLength={2000}
                style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input name="price" type="number" step="0.01" min="0" className="form-input"
                  value={form.price} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Stock *</label>
                <input name="stock" type="number" min="0" className="form-input"
                  value={form.stock} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input name="category" className="form-input" value={form.category}
                onChange={handleChange} maxLength={100}
                placeholder="e.g. Electronics, Books…" />
            </div>
            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input name="imageUrl" type="url" className="form-input" value={form.imageUrl}
                onChange={handleChange} placeholder="https://…" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
