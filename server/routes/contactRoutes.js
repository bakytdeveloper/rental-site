import express from 'express';
import {
    createContact,
    getContacts,
    getContact,
    updateContact,
    deleteContact,
    getContactStats
} from '../controllers/contactController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==================== ПУБЛИЧНЫЕ МАРШРУТЫ ====================

/**
 * @route   POST /api/contacts
 * @desc    Отправить общий контактный запрос (не связанный с арендой)
 * @access  Public
 * @body    {name, email, message, subject}
 * @returns {contact, message}
 *
 * Используется для:
 * - Общих вопросов
 * - Технической поддержки
 * - Сотрудничества
 * - Отправляет уведомление админу
 */
router.post('/', createContact);

// ==================== ЗАЩИЩЕННЫЕ МАРШРУТЫ ДЛЯ АДМИНА/МОДЕРАТОРА ====================

// Применяем защиту ко всем последующим маршрутам
router.use(protect);
router.use(authorize('admin', 'moderator'));

/**
 * @route   GET /api/contacts
 * @desc    Получить все контактные запросы
 * @access  Private/Admin Only
 * @header  Authorization: Bearer {token}
 * @query   {page, limit, status, search}
 * @returns {contacts, pagination}
 *
 * Статусы контактов:
 * - new (новый)
 * - contacted (связались)
 * - completed (завершен)
 */
router.get('/', getContacts);

/**
 * @route   GET /api/contacts/stats/summary
 * @desc    Получить статистику контактных запросов
 * @access  Private/Admin Only
 * @header  Authorization: Bearer {token}
 * @returns {stats}
 *
 * Включает:
 * - Общее количество
 * - По статусам
 * - Контакты за последние 7 дней
 */
router.get('/stats/summary', getContactStats);

/**
 * @route   GET /api/contacts/:id
 * @desc    Получить детали контактного запроса
 * @access  Private/Admin Only
 * @header  Authorization: Bearer {token}
 * @param   {id} - ID контакта
 * @returns {contact}
 */
router.get('/:id', getContact);

/**
 * @route   PUT /api/contacts/:id
 * @desc    Обновить контактный запрос
 * @access  Private/Admin Only
 * @header  Authorization: Bearer {token}
 * @param   {id} - ID контакта
 * @body    {status, notes, ...другие поля}
 * @returns {contact}
 *
 * В основном используется для обновления статуса
 */
router.put('/:id', updateContact);

/**
 * @route   DELETE /api/contacts/:id
 * @desc    Удалить контактный запрос
 * @access  Private/Admin Only
 * @header  Authorization: Bearer {token}
 * @param   {id} - ID контакта
 * @returns {message}
 */
router.delete('/:id', deleteContact);

export default router;