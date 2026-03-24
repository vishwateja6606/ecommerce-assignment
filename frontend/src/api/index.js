import axios from 'axios';

/**
 * Axios instance pointing at the Spring Boot backend.
 * Automatically attaches the JWT token from localStorage on every request.
 */
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8081',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor – attach Bearer token ─────────────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor – handle 401 / 403 globally ────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth endpoints ────────────────────────────────────────────────────────────
export const authAPI = {
  login:    (data) => API.post('/api/auth/login', data),
  register: (data) => API.post('/api/auth/register', data),
  getMe:    ()     => API.get('/api/auth/me'),
};

// ── Product endpoints ─────────────────────────────────────────────────────────
export const productAPI = {
  getAll:    ()          => API.get('/api/products'),
  getById:   (id)        => API.get(`/api/products/${id}`),
  search:    (keyword)   => API.get(`/api/products/search?keyword=${keyword}`),
  getByCategory: (cat)   => API.get(`/api/products/category/${cat}`),
  create:    (data)      => API.post('/api/products', data),
  update:    (id, data)  => API.put(`/api/products/${id}`, data),
  delete:    (id)        => API.delete(`/api/products/${id}`),
};

// ── User profile endpoints ────────────────────────────────────────────────────
export const userAPI = {
  getProfile:      ()     => API.get('/api/users/profile'),
  updateProfile:   (data) => API.put('/api/users/profile', data),
  changePassword:  (data) => API.put('/api/users/change-password', data),
  getAllUsers:      ()     => API.get('/api/users'),
};

export default API;
