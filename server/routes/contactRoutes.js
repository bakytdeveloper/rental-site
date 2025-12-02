import express from 'express';
import {
    getContacts,
    getContact,
    createContact,
    updateContact,
    deleteContact,
    getContactStats,
    addPayment,
    getPayments,
    getExpiringRentals,
    sendRentalReminders,
    getRentalStats
} from '../controllers/contactController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for form submissions
router.post('/', createContact);

// Protected routes
router.use(protect);
router.use(authorize('admin', 'moderator'));

router.get('/', getContacts);
router.get('/stats/summary', getContactStats);
router.get('/rentals/stats', getRentalStats);
router.get('/rentals/expiring', getExpiringRentals);
router.post('/rentals/send-reminders', sendRentalReminders);
router.get('/:id', getContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

// Payment routes
router.post('/:id/payments', addPayment);
router.get('/:id/payments', getPayments);

export default router;