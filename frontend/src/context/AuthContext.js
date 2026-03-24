import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

/**
 * Provides authentication state + helpers to the entire component tree.
 * Persists the JWT token and user object in localStorage so sessions
 * survive page refreshes.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  });
  const [token, setToken]     = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  // ── Verify stored token on mount ────────────────────────────────────────────
  useEffect(() => {
    const verify = async () => {
      if (token) {
        try {
          const { data } = await authAPI.getMe();
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handle OAuth2 redirect: ?token=xxx in URL ─────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get('token');
    if (oauthToken) {
      localStorage.setItem('token', oauthToken);
      setToken(oauthToken);
      window.history.replaceState({}, '', window.location.pathname);
      authAPI.getMe().then(({ data }) => {
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      }).catch(logout);
    }
  }, [logout]);

  const login = useCallback(async (credentials) => {
    const { data } = await authAPI.login(credentials);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setToken(data.token);
    setUser(data);
    return data;
  }, []);

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
