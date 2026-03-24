import React, { useState, useEffect } from 'react';
import { userAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

/**
 * User profile page with three tabs:
 *  1. Personal Info – view/edit name, phone, avatar URL
 *  2. Change Password – update password (local accounts only)
 *  3. Account Settings – role / provider info
 */
const ProfilePage = () => {
  const { isAdmin } = useAuth();
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState('info');
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  // Profile form state
  const [infoForm, setInfoForm] = useState({ fullName: '', phone: '', imageUrl: '' });

  // Password form state
  const [pwForm,   setPwForm]   = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await userAPI.getProfile();
        setProfile(data);
        setInfoForm({ fullName: data.fullName || '', phone: data.phone || '', imageUrl: data.imageUrl || '' });
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleInfoSave = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSaving(true);
    try {
      await userAPI.updateProfile(infoForm);
      setSuccess('Profile updated successfully!');
      toast.success('Profile updated!');
      setProfile(prev => ({ ...prev, ...infoForm }));
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setError('New passwords do not match'); return;
    }
    if (pwForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters'); return;
    }
    setSaving(true);
    try {
      await userAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setSuccess('Password changed successfully!');
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const initials = profile?.fullName
    ? profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : profile?.username?.[0]?.toUpperCase() || '?';

  if (loading) return <div className="spinner" />;

  return (
    <div className="profile-page">
      {/* Profile header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {profile?.imageUrl
            ? <img src={profile.imageUrl} alt={profile.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials}
        </div>
        <div>
          <div className="profile-name">{profile?.fullName || profile?.username}</div>
          <div className="profile-email">{profile?.email}</div>
          <div style={{ marginTop: '0.3rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className={`badge ${isAdmin ? 'admin' : ''}`}>
              {isAdmin ? 'Admin' : 'User'}
            </span>
            {profile?.provider && profile.provider !== 'local' && (
              <span className="badge" style={{ background: '#f3f4f6', color: '#374151' }}>
                via {profile.provider}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['info', 'password', 'settings'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`}
            onClick={() => { setTab(t); setError(''); setSuccess(''); }}>
            {t === 'info' ? '👤 Personal Info' : t === 'password' ? '🔒 Password' : '⚙️ Settings'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card">
        <div className="card-body">
          {error   && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* ── Personal Info ── */}
          {tab === 'info' && (
            <form onSubmit={handleInfoSave}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={infoForm.fullName}
                  onChange={e => setInfoForm(p => ({ ...p, fullName: e.target.value }))}
                  placeholder="Your full name" maxLength={100} />
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="form-input" value={profile?.username || ''} disabled
                  style={{ background: 'var(--bg)', color: 'var(--text-muted)' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={profile?.email || ''} disabled
                  style={{ background: 'var(--bg)', color: 'var(--text-muted)' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={infoForm.phone}
                  onChange={e => setInfoForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 98765 43210" maxLength={20} />
              </div>
              <div className="form-group">
                <label className="form-label">Profile Picture URL</label>
                <input className="form-input" value={infoForm.imageUrl}
                  onChange={e => setInfoForm(p => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="https://…" type="url" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* ── Change Password ── */}
          {tab === 'password' && (
            profile?.provider && profile.provider !== 'local'
              ? (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <div className="icon">🔗</div>
                  <h3>SSO Account</h3>
                  <p>Your account is linked via <strong>{profile.provider}</strong>.<br />
                    Password management is handled by your identity provider.</p>
                </div>
              )
              : (
                <form onSubmit={handlePasswordSave}>
                  <div className="form-group">
                    <label className="form-label">Current Password *</label>
                    <input type="password" className="form-input" value={pwForm.currentPassword}
                      onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                      required placeholder="••••••••" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password *</label>
                    <input type="password" className="form-input" value={pwForm.newPassword}
                      onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                      required minLength={6} placeholder="••••••••" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password *</label>
                    <input type="password" className="form-input" value={pwForm.confirmPassword}
                      onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                      required placeholder="••••••••" />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Updating…' : 'Change Password'}
                  </button>
                </form>
              )
          )}

          {/* ── Account Settings ── */}
          {tab === 'settings' && (
            <div>
              <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 700 }}>Account Information</h3>
              {[
                { label: 'User ID',     value: profile?.id },
                { label: 'Username',    value: profile?.username },
                { label: 'Email',       value: profile?.email },
                { label: 'Role',        value: profile?.role },
                { label: 'Auth Method', value: profile?.provider === 'local' ? 'Username & Password' : `OAuth2 via ${profile?.provider}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontWeight: 500 }}>{value}</span>
                </div>
              ))}

              <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fef2f2', borderRadius: '0.5rem', border: '1px solid #fca5a5' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.5rem' }}>Danger Zone</h4>
                <p style={{ fontSize: '0.82rem', color: '#b91c1c', marginBottom: '0.75rem' }}>
                  Account deletion is permanent and cannot be undone.
                </p>
                <button className="btn btn-danger btn-sm" onClick={() => toast.info('Contact support to delete your account.')}>
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
