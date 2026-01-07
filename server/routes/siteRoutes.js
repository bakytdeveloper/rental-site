import express from 'express';
import {
    getAllSites,
    getSiteById,
    createSite,
    updateSite,
    deleteSite,
    getFeaturedSites,
    getAllSitesAdmin,
    deleteSiteImages,
    toggleFeatured
} from '../controllers/siteController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==================== ПУБЛИЧНЫЕ МАРШРУТЫ ====================

/**
 * @route   GET /api/sites
 * @desc    Получить все активные сайты с фильтрацией
 * @access  Public
 * @query   {category, featured, page, limit}
 * @returns {sites, totalPages, currentPage, total}
 *
 * Используется для каталога сайтов на главной
 * Возвращает только isActive: true сайты
 */
router.get('/', getAllSites);

/**
 * @route   GET /api/sites/featured
 * @desc    Получить рекомендуемые сайты
 * @access  Public
 * @returns {sites} - массив до 6 сайтов
 *
 * Возвращает сайты с isFeatured: true и isActive: true
 * Сортировка по sortOrder и createdAt
 */
router.get('/featured', getFeaturedSites);

/**
 * @route   GET /api/sites/:id
 * @desc    Получить детали сайта по ID
 * @access  Public
 * @param   {id} - ID сайта
 * @returns {site} - полная информация о сайте
 *
 * Используется для страницы деталей сайта
 * Включает все изображения, технологии, особенности
 */
router.get('/:id', getSiteById);

// ==================== ЗАЩИЩЕННЫЕ МАРШРУТЫ ДЛЯ АДМИНА ====================

/**
 * @route   GET /api/sites/admin/list
 * @desc    Получить все сайты для админ-панели
 * @access  Private/Admin Only
 * @header  Authorization: Bearer {token}
 * @returns {sites}
 *
 * Возвращает ВСЕ сайты, включая неактивные
 * Сортировка по createdAt (новые сначала)
 */
router.get('/admin/list', protect, adminOnly, getAllSitesAdmin);

/**
 * @route   POST /api/sites
 * @desc    Создать новый сайт с загрузкой изображений
 * @access  Private/Admin Only
 * @header  Authorization: Bearer {token}
 * @body    FormData: {title, description, price, category, images[], technologies[], features[]}
 * @returns {site}
 *
 * Обязательные поля: title, description, shortDescription, price, category
 * Требуется хотя бы одно изображение
 * Максимум 7 изображений
 */
router.post('/', protect, adminOnly, createSite);

/**
 * @route   PUT /api/sites/:id
 * @desc    Обновить сайт с загрузкой изображений
 * @access  Private/Admin Only
 * @header  Authorization: Bearer {token}
 * @param   {id} - ID сайта
 * @body    FormData: {existingImages[], images[], ...остальные поля}
 * @returns {site}
 *
 * Можно добавлять новые и удалять старые изображения
 * Сохраняет существующие изображения из existingImages
 * Удаляет с сервера изображения не включенные в existingImages
 */
router.put('/:id', protect, adminOnly, updateSite);

/**
 * @route   DELETE /api/sites/:id/images
 * @desc    Удалить изображения сайта
 * @access  Private/Admin Only
 * @header  Authorization: Bearer {token}
 * @param   {id} - ID сайта
 * @body    {imageUrls} - массив URL изображений для удаления
 * @returns {message, remainingImages}
 *
 * Удаляет изображения с сервера и из массива images сайта
 */
router.delete('/:id/images', protect, adminOnly, deleteSiteImages);

/**
 * @route   DELETE /api/sites/:id
 * @desc    Удалить сайт и все его изображения
 * @access  Private/Admin Only
 * @header  Authorization: Bearer {token}
 * @param   {id} - ID сайта
 * @returns {message}
 *
 * Удаляет сайт из базы и ВСЕ его изображения с сервера
 * Необратимое действие
 */
router.delete('/:id', protect, adminOnly, deleteSite);

/**
 * @route   PATCH /api/sites/:id/featured
 * @desc    Переключить статус "Рекомендуемый"
 * @access  Private/Admin Only
 * @header  Authorization: Bearer {token}
 * @param   {id} - ID сайта
 * @returns {message, isFeatured}
 *
 * Переключает isFeatured между true/false
 */
router.patch('/:id/featured', protect, adminOnly, toggleFeatured);

export default router;