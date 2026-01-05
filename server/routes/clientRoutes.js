import express from 'express';
import {
    registerClient,
    loginClient,
    getClientProfile,
    updateClientProfile,
    updatePassword,
    getRentalDetails,
    linkContactToUser,
    getNotifications,
    markNotificationsAsRead
} from '../controllers/clientController.js';
import { protect, clientOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Публичные маршруты
router.post('/register', registerClient);
router.post('/login', loginClient);

// Защищенные маршруты только для клиентов
router.use(protect);
router.use(clientOnly);

router.get('/profile', getClientProfile);
router.put('/profile', updateClientProfile);
router.put('/password', updatePassword);
router.get('/rental/:contactId', getRentalDetails);
router.post('/link-contact', linkContactToUser);
router.get('/notifications', getNotifications);
router.put('/notifications/read', markNotificationsAsRead);

export default router;