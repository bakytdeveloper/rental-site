import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
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
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

// Site API
export const siteAPI = {
    getAll: (params = {}) => api.get('/sites', { params }),
    getAllAdmin: () => api.get('/sites/admin'),
    getFeatured: () => api.get('/sites/featured'),
    getById: (id) => api.get(`/sites/${id}`),
    create: (data) => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        };
        return api.post('/sites', data, config);
    },
    update: (id, data) => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        };
        return api.put(`/sites/${id}`, data, config);
    },
    deleteImages: (id, imageUrls) => api.delete(`/sites/${id}/images`, { data: { imageUrls } }),
    delete: (id) => api.delete(`/sites/${id}`),
};

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

// Contact API - удаляем priority из комментариев
// Обновим contactAPI
export const contactAPI = {
    getAll: (params = {}) => api.get('/contacts', { params }),
    getById: (id) => api.get(`/contacts/${id}`),
    create: (data) => api.post('/contacts', data),
    update: (id, data) => api.put(`/contacts/${id}`, data),
    delete: (id) => api.delete(`/contacts/${id}`),
    getStats: () => api.get('/contacts/stats/summary'),
    // Новые методы для платежей
    addPayment: (id, paymentData) => api.post(`/contacts/${id}/payments`, paymentData),
    getPayments: (id) => api.get(`/contacts/${id}/payments`),
    getExpiringRentals: (days = 3) => api.get(`/contacts/rentals/expiring?days=${days}`),
    sendReminders: () => api.post('/contacts/rentals/send-reminders'),
    getRentalStats: () => api.get('/contacts/rentals/stats')
};

// Utility function to handle API errors
export const handleApiError = (error, defaultMessage = 'Something went wrong') => {
    const message = error.response?.data?.message || defaultMessage;
    toast.error(message);
    return message;
};

export default api;