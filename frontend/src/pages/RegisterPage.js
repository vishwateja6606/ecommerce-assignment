import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { toast } from 'react-toastify';

/**
 * Registration page – creates a new ROLE_USER account.
 */
const RegisterPage = () => {
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirmPassword: '', fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authAPI.register({
        username: form.username,
        email:    form.email,
        password: form.password,
        fullName: form.fullName,
      });
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create an account</h1>
        <p className="auth-subtitle">Join ShopWave today – it's free!</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input name="fullName" className="form-input" value={form.fullName}
              onChange={handleChange} placeholder="Jane Doe" maxLength={100} />
          </div>
          <div className="form-group">
            <label className="form-label">Username *</label>
            <input name="username" className="form-input" value={form.username}
              onChange={handleChange} required minLength={3} maxLength={50}
              placeholder="janedoe" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input name="email" type="email" className="form-input" value={form.email}
              onChange={handleChange} required placeholder="jane@example.com" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input name="password" type="password" className="form-input"
                value={form.password} onChange={handleChange} required
                minLength={6} placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input name="confirmPassword" type="password" className="form-input"
                value={form.confirmPassword} onChange={handleChange}
                required placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
