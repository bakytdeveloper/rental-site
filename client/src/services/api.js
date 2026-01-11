import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ==================== КЕШИРОВАНИЕ ====================
const cache = {
    featuredSites: null,
    featuredSitesTime: null,
    featuredSitesDuration: 30000, // 30 секунд кеширования
    featuredSitesPromise: null, // Чтобы избежать параллельных запросов
};

// ==================== API ДЛЯ САЙТОВ ====================
export const siteAPI = {
    getAll: (params = {}) => {
        console.log('siteAPI.getAll called with params:', params);
        return api.get('/sites', { params });
    },

    getFeatured: async () => {
        const now = Date.now();

        // Если уже есть активный промис, возвращаем его (предотвращаем дублирование)
        if (cache.featuredSitesPromise) {
            console.log('📦 Returning existing promise for featured sites');
            return cache.featuredSitesPromise;
        }

        // Если есть кеш и он еще актуален, возвращаем его
        if (cache.featuredSites && cache.featuredSitesTime &&
            (now - cache.featuredSitesTime) < cache.featuredSitesDuration) {
            console.log('📦 Returning cached featured sites');
            return {
                data: cache.featuredSites,
                fromCache: true
            };
        }

        console.log('🌐 Making fresh API call for featured sites');

        // Создаем промис для запроса
        cache.featuredSitesPromise = api.get('/sites/featured')
            .then(response => {
                // Кешируем успешный ответ
                cache.featuredSites = response.data;
                cache.featuredSitesTime = now;
                console.log('✅ Featured sites cached successfully');
                return response;
            })
            .catch(error => {
                // В случае ошибки, если есть старый кеш, возвращаем его
                if (cache.featuredSites) {
                    console.log('⚠️ API error, returning cached data');
                    return {
                        data: cache.featuredSites,
                        fromCache: true,
                        error: true,
                        originalError: error
                    };
                }
                throw error;
            })
            .finally(() => {
                // Очищаем промис после завершения
                cache.featuredSitesPromise = null;
            });

        return cache.featuredSitesPromise;
    },

    // Очистка кеша (может понадобиться при логауте или обновлении данных)
    clearFeaturedCache: () => {
        cache.featuredSites = null;
        cache.featuredSitesTime = null;
        cache.featuredSitesPromise = null;
        console.log('🧹 Featured sites cache cleared');
    },

    getById: (id) => api.get(`/sites/${id}`),

    // Админские методы
    getAllAdmin: () => api.get('/sites/admin/list'),
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

            if (path.includes('/auth/admin')) {
                // Админская авторизация
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                if (window.location.pathname.startsWith('/admin')) {
                    window.location.href = '/auth/login';
                }
            } else if (path.includes('/client') || path.includes('/rentals/client')) {
                // Клиентская авторизация
                localStorage.removeItem('clientToken');
                localStorage.removeItem('clientData');
                if (window.location.pathname.startsWith('/client')) {
                    window.location.href = '/auth/login';
                }
            }

            // Очищаем кеш при логауте
            siteAPI.clearFeaturedCache();
        }

        return Promise.reject(error);
    }
);

// ==================== API ДЛЯ АДМИНА ====================
export const authAPI = {
    loginAdmin: (credentials) => api.post('/auth/admin/login', credentials),
    getAdminProfile: () => api.get('/auth/admin/me'),
};

// ==================== API ДЛЯ КЛИЕНТОВ ====================
export const clientAPI = {
    // Публичные методы
    register: (data) => api.post('/client/register', data),
    login: (data) => {
        return api.post('/client/login', data).then(response => {
            // Проверяем, есть ли сохраненные данные для заявки
            const pendingRental = localStorage.getItem('rentalPendingData');
            if (pendingRental && response.data.success) {
                const rentalData = JSON.parse(pendingRental);

                // Отправляем заявку с привязкой к пользователю
                return api.post('/rentals/request', {
                    ...rentalData.formData,
                    siteId: rentalData.siteId,
                    userId: response.data.user.id
                }).then(rentalResponse => {
                    // Очищаем сохраненные данные
                    localStorage.removeItem('rentalPendingData');

                    // Возвращаем объединенный ответ
                    return {
                        ...response,
                        data: {
                            ...response.data,
                            rentalCreated: true,
                            rental: rentalResponse.data.rental
                        }
                    };
                }).catch(error => {
                    localStorage.removeItem('rentalPendingData');
                    return response;
                });
            }
            return response;
        });
    },

    // Защищенные методы (требуют токен клиента)
    getProfile: () => api.get('/client/profile'),
    updateProfile: (data) => api.put('/client/profile', data),
    updatePassword: (data) => api.put('/client/password', data),
    linkRental: (rentalId) => api.post('/client/link-rental', { rentalId }),
    getNotifications: () => api.get('/client/notifications'),
    markNotificationsRead: (notificationIds) => api.put('/client/notifications/read', { notificationIds }),
};

// ==================== API ДЛЯ АРЕНД ====================
export const rentalAPI = {
    // Публичные методы
    requestRental: (data) => api.post('/rentals/request', data),

    // Защищенные методы для клиентов
    getMyRentals: () => api.get('/rentals/client/my-rentals'),

    // Защищенные методы для админа
    getAll: (params = {}) => api.get('/rentals', { params }),
    getById: (id) => api.get(`/rentals/${id}`),
    updateStatus: (id, data) => api.put(`/rentals/${id}/status`, data),
    updateDates: (id, dates) => api.put(`/rentals/${id}/dates`, dates),
    addPayment: (id, paymentData) => api.post(`/rentals/${id}/payments`, paymentData),
    getStats: () => api.get('/rentals/stats/overview'),
    searchRentals: (search) => api.get(`/rentals/search?query=${search}`),
    getActiveRentals: () => api.get('/rentals?status=active&limit=100'),
    getPendingRentals: () => api.get('/rentals?status=pending&limit=100'),
    getExpiringRentals: () => api.get('/rentals?status=active&sortBy=rentalEndDate&sortOrder=asc&limit=50'),
};

// ==================== API ДЛЯ КОНТАКТОВ ====================
export const contactAPI = {
    create: (data) => api.post('/contacts', data),
    getAll: (params = {}) => api.get('/contacts', { params }),
    getById: (id) => api.get(`/contacts/${id}`),
    update: (id, data) => api.put(`/contacts/${id}`, data),
    delete: (id) => api.delete(`/contacts/${id}`),
    getStats: () => api.get('/contacts/stats/summary'),
};

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

export const checkClientAuth = () => {
    const token = localStorage.getItem('clientToken');
    return !!token;
};

export const checkAdminAuth = () => {
    const token = localStorage.getItem('adminToken');
    return !!token;
};

export const getCurrentAuthType = () => {
    if (localStorage.getItem('clientToken')) {
        return 'client';
    }
    if (localStorage.getItem('adminToken')) {
        return 'admin';
    }
    return null;
};

export const logout = (type = null) => {
    if (type === 'client' || (!type && localStorage.getItem('clientToken'))) {
        localStorage.removeItem('clientToken');
        localStorage.removeItem('clientData');
        siteAPI.clearFeaturedCache(); // Очищаем кеш
        window.location.href = '/';
    } else if (type === 'admin' || (!type && localStorage.getItem('adminToken'))) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        siteAPI.clearFeaturedCache(); // Очищаем кеш
        window.location.href = '/';
    }
};

export const getCurrentUser = () => {
    const clientData = localStorage.getItem('clientData');
    if (clientData) {
        return JSON.parse(clientData);
    }

    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
        return JSON.parse(adminUser);
    }

    return null;
};

export default api;