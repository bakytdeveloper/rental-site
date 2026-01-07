import express from 'express';
import {
    registerClient,
    loginClient,
    getClientProfile,
    updateClientProfile,
    updatePassword,
    linkRentalToUser,
    getNotifications,
    markNotificationsAsRead
} from '../controllers/clientController.js';
import { protect, clientOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==================== ПУБЛИЧНЫЕ МАРШРУТЫ ====================

/**
 * @route   POST /api/client/register
 * @desc    Регистрация нового клиента
 * @access  Public
 * @body    {username, email, password, firstName, lastName, phone}
 * @returns {token, user}
 *
 * Создает нового клиента, отправляет приветственное письмо
 */
router.post('/register', registerClient);

/**
 * @route   POST /api/client/login
 * @desc    Вход клиента в систему
 * @access  Public
 * @body    {email, password}
 * @returns {token, user}
 *
 * Проверяет учетные данные клиента, обновляет lastLogin
 */
router.post('/login', loginClient);

// ==================== ЗАЩИЩЕННЫЕ МАРШРУТЫ ====================

// Применяем защиту ко всем последующим маршрутам
router.use(protect);
router.use(clientOnly);

/**
 * @route   GET /api/client/profile
 * @desc    Получить полный профиль клиента с арендами
 * @access  Private/Client Only
 * @header  Authorization: Bearer {token}
 * @returns {user, rentals, statistics, notifications}
 *
 * Включает:
 * - Информацию о пользователе
 * - Список всех аренд клиента
 * - Статистику (активные, ожидающие, просроченные)
 * - Последние уведомления
 */
router.get('/profile', getClientProfile);

/**
 * @route   PUT /api/client/profile
 * @desc    Обновить профиль клиента
 * @access  Private/Client Only
 * @header  Authorization: Bearer {token}
 * @body    {firstName, lastName, phone, company, settings}
 * @returns {user}
 *
 * Обновляет только профиль и настройки уведомлений
 */
router.put('/profile', updateClientProfile);

/**
 * @route   PUT /api/client/password
 * @desc    Изменить пароль клиента
 * @access  Private/Client Only
 * @header  Authorization: Bearer {token}
 * @body    {currentPassword, newPassword}
 * @returns {message}
 *
 * Проверяет текущий пароль перед изменением
 */
router.put('/password', updatePassword);

/**
 * @route   POST /api/client/link-rental
 * @desc    Привязать существующую аренду к аккаунту клиента
 * @access  Private/Client Only
 * @header  Authorization: Bearer {token}
 * @body    {rentalId}
 * @returns {message, rental}
 *
 * Используется когда клиент регистрируется после подачи заявки на аренду
 * Связывает аренду по email клиента
 */
router.post('/link-rental', linkRentalToUser);

/**
 * @route   GET /api/client/notifications
 * @desc    Получить уведомления клиента
 * @access  Private/Client Only
 * @header  Authorization: Bearer {token}
 * @returns {notifications, unreadCount}
 *
 * Возвращает последние 20 уведомлений:
 * - payment (платежи)
 * - rental_expiring (истечение аренды)
 * - rental_expired (аренда истекла)
 * - system (системные)
 */
router.get('/notifications', getNotifications);

/**
 * @route   PUT /api/client/notifications/read
 * @desc    Отметить уведомления как прочитанные
 * @access  Private/Client Only
 * @header  Authorization: Bearer {token}
 * @body    {notificationIds} - опционально, массив ID
 * @returns {message}
 *
 * Если notificationIds не указан, отмечает все как прочитанные
 */
router.put('/notifications/read', markNotificationsAsRead);

export default router;