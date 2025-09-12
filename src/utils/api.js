import axios from 'axios';
import { getStorageItem } from './helpers';

const BASE_URL = 'https://api-inventory.isavralabel.com/desa-darit/api';
export const BASE_IMAGE_URL = 'https://api-inventory.isavralabel.com/desa-darit/uploads';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Token is stored via setStorageItem which JSON.stringify's the value
    // Use helper to parse it back to a plain string to avoid quoted tokens
    const token = getStorageItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// API Endpoints
export const endpoints = {
  // Auth endpoints
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  
  // News endpoints
  news: {
    getAll: '/news',
    getById: (id) => `/news/${id}`,
    create: '/news',
    update: (id) => `/news/${id}`,
    delete: (id) => `/news/${id}`,
    upload: '/news/upload',
  },
  
  // Village Profile endpoints
  profile: {
    get: '/profile',
    update: '/profile',
    uploadImage: '/profile/upload',
  },
  
  // Infographics endpoints
  infographics: {
    get: '/infographics',
    update: '/infographics',
  },
  
  // Shop endpoints
  shop: {
    getAll: '/shop',
    getById: (id) => `/shop/${id}`,
    create: '/shop',
    update: (id) => `/shop/${id}`,
    delete: (id) => `/shop/${id}`,
    upload: '/shop/upload',
  },
  
  // Organization endpoints
  organization: {
    getAll: '/organization',
    getById: (id) => `/organization/${id}`,
    create: '/organization',
    update: (id) => `/organization/${id}`,
    delete: (id) => `/organization/${id}`,
    upload: '/organization/upload',
  },
  
  // Banners endpoints
  banners: {
    getAll: '/banners',
    getById: (id) => `/banners/${id}`,
    create: '/banners',
    update: (id) => `/banners/${id}`,
    delete: (id) => `/banners/${id}`,
    upload: '/banners/upload',
  },
  
  // Dashboard endpoints
  dashboard: {
    stats: '/dashboard/stats',
  },
  
  // Contact settings endpoints
  contactSettings: {
    get: '/contact-settings',
    update: '/contact-settings',
  },
};

// API methods
export const authAPI = {
  login: (credentials) => api.post(endpoints.auth.login, credentials),
  logout: () => api.post(endpoints.auth.logout),
  getMe: () => api.get(endpoints.auth.me),
};

export const newsAPI = {
  getAll: (params) => api.get(endpoints.news.getAll, { params }),
  getById: (id) => api.get(endpoints.news.getById(id)),
  create: (data) => api.post(endpoints.news.create, data),
  update: (id, data) => api.put(endpoints.news.update(id), data),
  delete: (id) => api.delete(endpoints.news.delete(id)),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(endpoints.news.upload, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const profileAPI = {
  get: () => api.get(endpoints.profile.get),
  update: (data) => api.put(endpoints.profile.update, data),
  uploadImage: (file, type) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    return api.post(endpoints.profile.uploadImage, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const infographicsAPI = {
  get: () => api.get(endpoints.infographics.get),
  update: (data) => api.put(endpoints.infographics.update, data),
};

export const shopAPI = {
  getAll: (params) => api.get(endpoints.shop.getAll, { params }),
  getById: (id) => api.get(endpoints.shop.getById(id)),
  create: (data) => api.post(endpoints.shop.create, data),
  update: (id, data) => api.put(endpoints.shop.update(id), data),
  delete: (id) => api.delete(endpoints.shop.delete(id)),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(endpoints.shop.upload, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const organizationAPI = {
  getAll: (params) => api.get(endpoints.organization.getAll, { params }),
  getById: (id) => api.get(endpoints.organization.getById(id)),
  create: (data) => api.post(endpoints.organization.create, data),
  update: (id, data) => api.put(endpoints.organization.update(id), data),
  delete: (id) => api.delete(endpoints.organization.delete(id)),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(endpoints.organization.upload, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const bannersAPI = {
  getAll: (params) => api.get(endpoints.banners.getAll, { params }),
  getById: (id) => api.get(endpoints.banners.getById(id)),
  create: (data) => api.post(endpoints.banners.create, data),
  update: (id, data) => api.put(endpoints.banners.update(id), data),
  delete: (id) => api.delete(endpoints.banners.delete(id)),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(endpoints.banners.upload, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const dashboardAPI = {
  getStats: () => api.get(endpoints.dashboard.stats),
};

export const contactSettingsAPI = {
  get: () => api.get(endpoints.contactSettings.get),
  update: (data) => api.put(endpoints.contactSettings.update, data),
};

export default api;