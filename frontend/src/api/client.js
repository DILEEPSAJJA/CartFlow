import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
};

export const productService = {
  getAllProducts: () => api.get('/api/products'),
  getProductById: (id) => api.get(`/api/products/${id}`),
  createProduct: (data) => api.post('/api/products', data),
  updateProduct: (id, data) => api.put(`/api/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/api/products/${id}`),
};

export const userService = {
  getUserById: (id) => api.get(`/api/users/${id}`),
  updateProfile: (id, profileData) => api.put(`/api/users/${id}/profile`, profileData),
  addAddress: (id, address) => api.post(`/api/users/${id}/addresses`, address),
  deleteAddress: (id, index) => api.delete(`/api/users/${id}/addresses/${index}`),
};

export const orderService = {
  createOrder: (orderData) => api.post('/api/orders', orderData),
  getAllOrders: () => api.get('/api/orders'),
  getOrderById: (id) => api.get(`/api/orders/${id}`),
  getOrdersByCustomer: (customerId) => api.get(`/api/orders/customer/${customerId}`),
  cancelOrder: (id, reason) => api.put(`/api/orders/${id}/cancel${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`),
  updateOrderStatus: (id, status) => api.put(`/api/orders/${id}/status?status=${status}`),
  requestReturn: (id, reason) => api.put(`/api/orders/${id}/return${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`),
};

export const paymentService = {
  toggleFailureSimulation: () => api.post('/api/payments/toggle-failure'),
  getSimulationStatus: () => api.get('/api/payments/status-simulation'),
};

export default api;
