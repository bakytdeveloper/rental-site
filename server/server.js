import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import siteRoutes from './routes/siteRoutes.js';
import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import rentalRoutes from './routes/rentalRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import { setupRentalCronJobs } from './cronJobs.js';

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB подключена успешно');

        // Настраиваем cron задачи
        if (process.env.NODE_ENV !== 'test' && process.env.DISABLE_CRON !== 'true') {
            setupRentalCronJobs();
        }
    })
    .catch(err => {
        console.log('❌ Ошибка подключения к MongoDB:', err);
        process.exit(1);
    });

// ==================== API МАРШРУТЫ ====================

/**
 * @route   /api/sites
 * @desc    Управление шаблонами сайтов
 * @access  Public (чтение), Admin (запись)
 * @endpoints:
 * - GET    /                 → Каталог сайтов
 * - GET    /featured         → Рекомендуемые сайты
 * - GET    /:id              → Детали сайта
 * - GET    /admin/list       → Все сайты (админ)
 * - POST   /                 → Создать сайт (админ)
 * - PUT    /:id              → Обновить сайт (админ)
 * - DELETE /:id/images       → Удалить изображения (админ)
 * - DELETE /:id              → Удалить сайт (админ)
 * - PATCH  /:id/featured     → Тоггл "Рекомендуемый" (админ)
 */
app.use('/api/sites', siteRoutes);

/**
 * @route   /api/auth
 * @desc    Аутентификация администратора
 * @access  Public (логин), Admin (профиль)
 * @endpoints:
 * - POST   /admin/login      → Вход администратора
 * - GET    /admin/me         → Профиль администратора
 */
app.use('/api/auth', authRoutes);

/**
 * @route   /api/client
 * @desc    Управление клиентами
 * @access  Public (регистрация/логин), Client (остальное)
 * @endpoints:
 * - POST   /register         → Регистрация клиента
 * - POST   /login            → Вход клиента
 * - GET    /profile          → Профиль клиента с арендами
 * - PUT    /profile          → Обновить профиль
 * - PUT    /password         → Сменить пароль
 * - POST   /link-rental      → Привязать аренду к аккаунту
 * - GET    /notifications    → Уведомления клиента
 * - PUT    /notifications/read → Отметить как прочитанные
 */
app.use('/api/client', clientRoutes);

/**
 * @route   /api/rentals
 * @desc    Управление арендами сайтов
 * @access  Public (заявка), Client (свои аренды), Admin (все)
 * @endpoints:
 * - POST   /request          → Подать заявку на аренду
 * - GET    /client/my-rentals→ Аренды текущего клиента
 * - GET    /                 → Все аренды (админ)
 * - GET    /stats/overview   → Статистика аренд (админ)
 * - GET    /:id              → Детали аренды (админ/владелец)
 * - PUT    /:id/status       → Обновить статус (админ)
 * - PUT    /:id/dates        → Обновить даты (админ)
 * - POST   /:id/payments     → Добавить платеж (админ)
 */
app.use('/api/rentals', rentalRoutes);

/**
 * @route   /api/contacts
 * @desc    Общие контактные запросы (не связанные с арендой)
 * @access  Public (создание), Admin (управление)
 * @endpoints:
 * - POST   /                 → Создать контакт
 * - GET    /                 → Все контакты (админ)
 * - GET    /stats/summary    → Статистика контактов (админ)
 * - GET    /:id              → Детали контакта (админ)
 * - PUT    /:id              → Обновить контакт (админ)
 * - DELETE /:id              → Удалить контакт (админ)
 */
app.use('/api/contacts', contactRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Rental Site API работает',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Добро пожаловать в Rental Site API',
        endpoints: {
            sites: '/api/sites',
            auth: '/api/auth',
            client: '/api/client',
            rentals: '/api/rentals',
            contacts: '/api/contacts',
            health: '/api/health'
        },
        documentation: process.env.API_DOCS_URL || '/api-docs'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Ошибка:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Что-то пошло не так!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Маршрут не найден'
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📊 Проверка здоровья: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Окружение: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📅 Время запуска: ${new Date().toLocaleString('ru-RU')}`);

    console.log('\n📋 Доступные маршруты:');
    console.log('├─ 📁 /api/sites - Шаблоны сайтов');
    console.log('├─ 🔐 /api/auth - Аутентификация администратора');
    console.log('├─ 👤 /api/client - Клиенты');
    console.log('├─ 🏠 /api/rentals - Аренды сайтов');
    console.log('└─ 📧 /api/contacts - Контактные запросы');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Получен сигнал SIGTERM. Завершение работы...');
    server.close(() => {
        console.log('✅ Сервер успешно завершил работу');
        mongoose.connection.close(false, () => {
            console.log('✅ Подключение к MongoDB закрыто');
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    console.log('🛑 Получен сигнал SIGINT. Завершение работы...');
    server.close(() => {
        console.log('✅ Сервер успешно завершил работу');
        mongoose.connection.close(false, () => {
            console.log('✅ Подключение к MongoDB закрыто');
            process.exit(0);
        });
    });
});

export default app;