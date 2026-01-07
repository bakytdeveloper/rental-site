import express from 'express';
import { loginAdmin, getAdminProfile } from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/admin/login
 * @desc    Вход администратора
 * @access  Public
 * @body    {email, password}
 * @returns {token, user}
 *
 * Использует учетные данные из .env файла:
 * - ADMIN_EMAIL
 * - ADMIN_PASSWORD
 * - ADMIN_USERNAME
 */
router.post('/admin/login', loginAdmin);

/**
 * @route   GET /api/auth/admin/me
 * @desc    Получить профиль текущего администратора
 * @access  Private/Admin Only
 * @header  Authorization: Bearer {token}
 * @returns {user}
 *
 * Возвращает информацию об администраторе из .env файла
 */
router.get('/admin/me', protect, adminOnly, getAdminProfile);

export default router;