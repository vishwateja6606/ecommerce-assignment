import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import Navbar           from './components/Navbar';
import ProtectedRoute   from './components/ProtectedRoute';

import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import DashboardPage     from './pages/DashboardPage';
import ProfilePage       from './pages/ProfilePage';
import AdminPage         from './pages/AdminPage';
import OAuth2RedirectPage from './pages/OAuth2RedirectPage';

import './styles/global.css';

/**
 * Application root.
 * Route layout:
 *   /              → Dashboard (public – but admins see edit/delete controls)
 *   /login         → Login page
 *   /register      → Registration page
 *   /profile       → User profile (requires auth)
 *   /admin         → Admin panel (requires ROLE_ADMIN)
 *   /oauth2/redirect → OAuth2 token handler
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/"         element={<DashboardPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />

          {/* Authenticated routes */}
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />

          {/* Admin-only route */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
