import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Top navigation bar.
 * Shows different links based on authentication state and user role.
 */
const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.username?.[0]?.toUpperCase() || '?';

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand" style={{ textDecoration: 'none' }}>
          🛍 Shop<span>Wave</span>
        </Link>

        {/* Links */}
        <ul className="navbar-links">
          <li><Link to="/">Dashboard</Link></li>
          {isAuthenticated && (
            <li><Link to="/profile">Profile</Link></li>
          )}
          {isAdmin && (
            <li><Link to="/admin">Admin</Link></li>
          )}
        </ul>

        {/* User info / auth buttons */}
        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              <div className="navbar-user">
                <div className="avatar">
                  {user?.imageUrl
                    ? <img src={user.imageUrl} alt={user.username} />
                    : initials}
                </div>
                <span>{user?.username}</span>
                <span className={`badge ${isAdmin ? 'admin' : ''}`}>
                  {isAdmin ? 'Admin' : 'User'}
                </span>
              </div>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <li><Link to="/login" className="btn btn-ghost btn-sm">Login</Link></li>
              <li><Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link></li>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
