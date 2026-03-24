import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Landing page for OAuth2 redirect.
 * The backend redirects here with ?token=<jwt>.
 * AuthContext picks up the token automatically; this page just shows a spinner.
 */
const OAuth2RedirectPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Give AuthContext 1.5 s to process the token from the URL query param
    const timer = setTimeout(() => {
      navigate(isAuthenticated ? '/' : '/login', { replace: true });
    }, 1500);
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <div className="spinner" />
      <p style={{ color: 'var(--text-muted)' }}>Completing sign-in…</p>
    </div>
  );
};

export default OAuth2RedirectPage;
