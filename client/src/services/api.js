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
        // Проверяем clientToken в первую очередь
        const clientToken = localStorage.getItem('clientToken');
        if (clientToken) {
            config.headers.Authorization = `Bearer ${clientToken}`;
            return config;
        }

        // Затем проверяем adminToken
        const adminToken = localStorage.getItem('adminToken');
        if (adminToken) {
            config.headers.Authorization = `Bearer ${adminToken}`;
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
            // Определяем, какой токен удалять
            const path = error.config.url;

            if (path.includes('/admin') || path.includes('/auth')) {
                // Админская авторизация
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                if (window.location.pathname.startsWith('/admin')) {
                    window.location.href = '/admin/login';
                }
            } else if (path.includes('/client')) {
                // Клиентская авторизация
                localStorage.removeItem('clientToken');
                localStorage.removeItem('clientData');
                if (window.location.pathname.startsWith('/client')) {
                    window.location.href = '/client/login';
                }
            }
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
    toggleFeatured: (id) => api.patch(`/sites/${id}/featured`),
    deleteImages: (id, imageUrls) => api.delete(`/sites/${id}/images`, { data: { imageUrls } }),
    delete: (id) => api.delete(`/sites/${id}`),
};

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

// Contact API
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
    getRentalStats: () => api.get('/contacts/rentals/stats'),
    checkExpiredRentals: () => api.post('/contacts/rentals/check-expired'),
};

// Client API
export const clientAPI = {
    register: (data) => api.post('/client/register', data),
    login: (data) => api.post('/client/login', data),
    getProfile: () => api.get('/client/profile'),
    updateProfile: (data) => api.put('/client/profile', data),
    updatePassword: (data) => api.put('/client/password', data),
    getRentalDetails: (contactId) => api.get(`/client/rental/${contactId}`),
    linkContact: (contactId) => api.post('/client/link-contact', { contactId }),
    getNotifications: () => api.get('/client/notifications'),
    markNotificationsRead: (notificationIds) => api.put('/client/notifications/read', { notificationIds }),
};

// Auth check functions
export const checkClientAuth = () => {
    const token = localStorage.getItem('clientToken');
    return !!token;
};

export const checkAdminAuth = () => {
    const token = localStorage.getItem('adminToken');
    return !!token;
};

// Utility function to handle API errors
export const handleApiError = (error, defaultMessage = 'Что-то пошло не так') => {
    const message = error.response?.data?.message || defaultMessage;

    // Не показываем toast для 401 ошибок (перенаправляем на логин)
    if (error.response?.status !== 401) {
        toast.error(message);
    }

    return message;
};

// Проверка, какой токен сейчас активен
export const getCurrentAuthType = () => {
    if (localStorage.getItem('clientToken')) {
        return 'client';
    }
    if (localStorage.getItem('adminToken')) {
        return 'admin';
    }
    return null;
};

export default api;