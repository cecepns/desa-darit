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
  
  // APB Desa endpoints
  apb: {
    years: {
      getAll: '/apb/years',
      getById: (id) => `/apb/years/${id}`,
      create: '/apb/years',
      update: (id) => `/apb/years/${id}`,
      delete: (id) => `/apb/years/${id}`,
      activate: (id) => `/apb/years/${id}/activate`,
    },
    statusSummary: '/apb/status-summary',
    income: {
      getAll: '/apb/income',
      getByYear: (yearId) => `/apb/income/year/${yearId}`,
      getById: (id) => `/apb/income/${id}`,
      create: '/apb/income',
      update: (id) => `/apb/income/${id}`,
      delete: (id) => `/apb/income/${id}`,
    },
    expenditure: {
      getAll: '/apb/expenditure',
      getByYear: (yearId) => `/apb/expenditure/year/${yearId}`,
      getById: (id) => `/apb/expenditure/${id}`,
      create: '/apb/expenditure',
      update: (id) => `/apb/expenditure/${id}`,
      delete: (id) => `/apb/expenditure/${id}`,
    },
    categories: {
      income: {
        getAll: '/apb/categories/income',
        create: '/apb/categories/income',
        update: (id) => `/apb/categories/income/${id}`,
        delete: (id) => `/apb/categories/income/${id}`,
      },
      expenditure: {
        getAll: '/apb/categories/expenditure',
        create: '/apb/categories/expenditure',
        update: (id) => `/apb/categories/expenditure/${id}`,
        delete: (id) => `/apb/categories/expenditure/${id}`,
      },
    },
    summary: {
      getByYear: (yearId) => `/apb/summary/${yearId}`,
      getAll: '/apb/summary',
    },
  },
  
  // Complaints endpoints
  complaints: {
    getAll: '/complaints',
    getById: (id) => `/complaints/${id}`,
    create: '/complaints',
    update: (id) => `/complaints/${id}`,
    delete: (id) => `/complaints/${id}`,
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
  uploadImage: (file, newsId = null) => {
    const formData = new FormData();
    formData.append('image', file);
    if (newsId) {
      formData.append('newsId', newsId);
    }
    return api.post(endpoints.news.upload, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const profileAPI = {
  get: () => api.get(endpoints.profile.get),
  update: (data) => api.put(endpoints.profile.update, data),
  uploadImage: (file, type) => {
    console.log('profileAPI.uploadImage called with type:', type);
    console.log('API Base URL:', BASE_URL);
    console.log('Upload endpoint:', endpoints.profile.uploadImage);
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    
    // Log the final URL being called
    console.log('Final upload URL:', `${BASE_URL}${endpoints.profile.uploadImage}`);
    
    return api.post(endpoints.profile.uploadImage, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  // Alternative upload method for head_village_image using main_image endpoint
  uploadHeadVillageImage: (file) => {
    console.log('profileAPI.uploadHeadVillageImage called');
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', 'main_image'); // Use main_image type but we'll handle it differently
    
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
  uploadImage: (file, productId = null) => {
    const formData = new FormData();
    formData.append('image', file);
    if (productId) {
      formData.append('productId', productId);
    }
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
  uploadImage: (file, memberId = null) => {
    const formData = new FormData();
    formData.append('image', file);
    if (memberId) {
      formData.append('memberId', memberId);
    }
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
  uploadImage: (file, bannerId = null) => {
    const formData = new FormData();
    formData.append('image', file);
    if (bannerId) {
      formData.append('bannerId', bannerId);
    }
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

export const apbAPI = {
  // Years
  years: {
    getAll: (params) => api.get(endpoints.apb.years.getAll, { params }),
    getById: (id) => api.get(endpoints.apb.years.getById(id)),
    create: (data) => api.post(endpoints.apb.years.create, data),
    update: (id, data) => api.put(endpoints.apb.years.update(id), data),
    delete: (id) => api.delete(endpoints.apb.years.delete(id)),
    activate: (id, data = {}) => api.put(endpoints.apb.years.activate(id), data),
  },
  
  // Income
  income: {
    getAll: (params) => api.get(endpoints.apb.income.getAll, { params }),
    getByYear: (yearId) => api.get(endpoints.apb.income.getByYear(yearId)),
    getById: (id) => api.get(endpoints.apb.income.getById(id)),
    create: (data) => api.post(endpoints.apb.income.create, data),
    update: (id, data) => api.put(endpoints.apb.income.update(id), data),
    delete: (id) => api.delete(endpoints.apb.income.delete(id)),
  },
  
  // Expenditure
  expenditure: {
    getAll: (params) => api.get(endpoints.apb.expenditure.getAll, { params }),
    getByYear: (yearId) => api.get(endpoints.apb.expenditure.getByYear(yearId)),
    getById: (id) => api.get(endpoints.apb.expenditure.getById(id)),
    create: (data) => api.post(endpoints.apb.expenditure.create, data),
    update: (id, data) => api.put(endpoints.apb.expenditure.update(id), data),
    delete: (id) => api.delete(endpoints.apb.expenditure.delete(id)),
  },
  
  // Categories
  categories: {
    income: {
      getAll: () => api.get(endpoints.apb.categories.income.getAll),
      create: (data) => api.post(endpoints.apb.categories.income.create, data),
      update: (id, data) => api.put(endpoints.apb.categories.income.update(id), data),
      delete: (id) => api.delete(endpoints.apb.categories.income.delete(id)),
    },
    expenditure: {
      getAll: () => api.get(endpoints.apb.categories.expenditure.getAll),
      create: (data) => api.post(endpoints.apb.categories.expenditure.create, data),
      update: (id, data) => api.put(endpoints.apb.categories.expenditure.update(id), data),
      delete: (id) => api.delete(endpoints.apb.categories.expenditure.delete(id)),
    },
  },
  
  // Summary
  summary: {
    getByYear: (yearId) => api.get(endpoints.apb.summary.getByYear(yearId)),
    getAll: () => api.get(endpoints.apb.summary.getAll),
  },
  
  // Status Summary
  getStatusSummary: () => api.get(endpoints.apb.statusSummary),
};

export const complaintsAPI = {
  getAll: (params) => api.get(endpoints.complaints.getAll, { params }),
  getById: (id) => api.get(endpoints.complaints.getById(id)),
  create: (data) => api.post(endpoints.complaints.create, data),
  update: (id, data) => api.put(endpoints.complaints.update(id), data),
  delete: (id) => api.delete(endpoints.complaints.delete(id)),
};

export default api;