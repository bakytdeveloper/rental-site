import express from 'express';
import {
    requestRental,
    getAllRentals,
    getRentalById,
    updateRentalStatus,
    addPayment,
    getRentalStats,
    getMyRentals,
    updateRentalDates
} from '../controllers/rentalController.js';
import { protect, authorize, adminOnly, clientOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==================== ПУБЛИЧНЫЕ МАРШРУТЫ ====================

/**
 * @route   POST /api/rentals/request
 * @desc    Подать заявку на аренду сайта
 * @access  Public
 * @body    {siteId, name, email, phone, message, userId}
 * @returns {message, rental}
 *
 * Создает заявку со статусом 'pending'
 * Отправляет уведомление админу
 * Если userId указан, связывает с пользователем
 */
router.post('/request', requestRental);

// ==================== ЗАЩИЩЕННЫЕ МАРШРУТЫ ДЛЯ КЛИЕНТОВ ====================

/**
 * @route   GET /api/rentals/client/my-rentals
 * @desc    Получить все аренды текущего клиента
 * @access  Private/Client Only
 * @header  Authorization: Bearer {token}
 * @returns {rentals, stats}
 *
 * Возвращает все аренды пользователя с деталями сайтов
 * Включает статистику: активные, ожидающие, просроченные
 */
router.get('/client/my-rentals', protect, clientOnly, getMyRentals);

// ==================== ЗАЩИЩЕННЫЕ МАРШРУТЫ ДЛЯ АДМИНА ====================

/**
 * @route   GET /api/rentals
 * @desc    Получить все аренды с фильтрацией и пагинацией
 * @access  Private/Admin Only
 * @header  Authorization: Bearer {token}
 * @query   {page, limit, status, search, sortBy, sortOrder}
 * @returns {rentals, pagination}
 *
 * Параметры запроса:
 * - status: 'pending' | 'active' | 'payment_due' | 'cancelled'
 * - search: поиск по имени, email или названию сайта
 * - sortBy: 'createdAt' | 'rentalEndDate' | 'monthlyPrice'
 * - sortOrder: 'asc' | 'desc'
 */
router.get('/', protect, adminOnly, getAllRentals);

/**
 * @route   GET /api/rentals/stats/overview
 * @desc    Получить статистику по арендам
 * @access  Private/Admin Only
 * @header  Authorization: Bearer {token}
 * @returns {stats}
 *
 * Включает:
 * - Количество по статусам
 * - Общую выручку
 * - Ежемесячную выручку
 * - Аренды, истекающие в течение недели
 */
router.get('/stats/overview', protect, adminOnly, getRentalStats);

/**
 * @route   GET /api/rentals/:id
 * @desc    Получить детали аренды по ID
 * @access  Private (Админ или владелец)
 * @header  Authorization: Bearer {token}
 * @param   {id} - ID аренды
 * @returns {rental}
 *
 * Доступ имеют:
 * - Администратор
 * - Владелец аренды (клиент)
 */
router.get('/:id', protect, getRentalById);

/**
 * @route   PUT /api/rentals/:id/status
 * @desc    Обновить статус аренды
 * @access  Private/Admin Only
 * @header  Authorization: Bearer {token}
 * @param   {id} - ID аренды
 * @body    {status} - новый статус
 * @returns {message, rental}
 *
 * Допустимые статусы:
 * - 'pending' → 'active' (устанавливает даты)
 * - 'active' → 'payment_due' (при истечении)
 * - 'payment_due' → 'active' (после оплаты)
 * - любое → 'cancelled'
 */
router.put('/:id/status', protect, adminOnly, updateRentalStatus);

/**
 * @route   PUT /api/rentals/:id/dates
 * @desc    Обновить даты аренды
 * @access  Private/Admin Only
 * @header  Authorization: Bearer {token}
 * @param   {id} - ID аренды
 * @body    {rentalStartDate, rentalEndDate}
 * @returns {message, rental}
 *
 * Ручное управление датами аренды
 * Используется для корректировок
 */
router.put('/:id/dates', protect, adminOnly, updateRentalDates);

/**
 * @route   POST /api/rentals/:id/payments
 * @desc    Добавить платеж к аренде
 * @access  Private/Admin Only
 * @header  Authorization: Bearer {token}
 * @param   {id} - ID аренды
 * @body    {amount, paymentMethod, notes, periodMonths}
 * @returns {message, payment, rental}
 *
 * Автоматически:
 * - Обновляет totalPaid
 * - Обновляет статус на 'active'
 * - Продлевает дату окончания
 * - Отправляет уведомления клиенту и админу
 */
router.post('/:id/payments', protect, adminOnly, addPayment);

export default router;