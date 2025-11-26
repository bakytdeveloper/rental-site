import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Site API
export const siteAPI = {
    getAll: (params = {}) => api.get('/sites', { params }),
    getFeatured: () => api.get('/sites/featured'),
    getById: (id) => api.get(`/sites/${id}`),
    create: (data) => api.post('/sites', data),
    update: (id, data) => api.put(`/sites/${id}`, data),
    delete: (id) => api.delete(`/sites/${id}`),
};

export default api;