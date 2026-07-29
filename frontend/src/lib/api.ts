import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Public APIs
export const publicApi = {
  getProducts: (params?: any) =>
    api.get('/products', { params }).then(res => res.data),
  getProductById: (id: string) =>
    api.get(`/products/${id}`).then(res => res.data),
  getServices: () =>
    api.get('/services').then(res => res.data),
  getCategories: () =>
    api.get('/categories').then(res => {
      // Debug what's returned
      console.log('Categories API response:', res.data);
      
      // Handle different response formats
      const data = res.data;
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.categories)) {
        return data.categories;
      } else if (data && Array.isArray(data.data)) {
        return data.data;
      }
      // If nothing matches, return empty array
      return [];
    }),
};

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) =>
    api.post('/auth/register', data),
  getCurrentUser: () =>
    api.get('/auth/me'),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  googleAuth: (credential: string) =>
    api.post('/auth/google', { credential }),
};

// OTP API
export const otpApi = {
  sendOtp: (email: string, type: 'REGISTRATION' | 'RESET_PASSWORD') =>
    api.post('/otp/send', { email, type }),
  verifyOtp: (email: string, otp: string, type: 'REGISTRATION' | 'RESET_PASSWORD') =>
    api.post('/otp/verify', { email, otp, type }),
};

// User APIs
export const userApi = {
  createOrder: (data: any) => api.post('/orders', data),
  getMyOrders: (params?: any) => api.get('/orders/my-orders', { params }),
  createBooking: (data: any) => api.post('/bookings', data),
  getMyBookings: (params?: any) => api.get('/bookings/my-bookings', { params }),
};

// Admin APIs
export const adminApi = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  
  // Products
  getProducts: (params?: any) => api.get('/admin/products', { params }),
  createProduct: (data: any) => api.post('/admin/products', data),
  updateProduct: (id: string, data: any) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
  
  // Orders
  getOrders: (params?: any) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id: string, data: any) => api.patch(`/admin/orders/${id}/status`, data),
  
  // Bookings
  getBookings: (params?: any) => api.get('/admin/bookings', { params }),
  updateBookingStatus: (id: string, data: any) => api.patch(`/admin/bookings/${id}/status`, data),
  
  // Categories
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data: any) => api.post('/admin/categories', data),
};

export default api;