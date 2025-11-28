// server/routes/siteRoutes.js
import express from 'express';
import {
    getAllSites,
    getSiteById,
    createSite,
    updateSite,
    deleteSite,
    getFeaturedSites,
    getAllSitesAdmin,
    deleteSiteImages  // Добавляем новый метод
} from '../controllers/siteController.js';

const router = express.Router();

router.get('/', getAllSites);
router.get('/admin', getAllSitesAdmin);
router.get('/featured', getFeaturedSites);
router.get('/:id', getSiteById);
router.post('/', createSite);
router.put('/:id', updateSite);
router.delete('/:id/images', deleteSiteImages); // Новый маршрут для удаления изображений
router.delete('/:id', deleteSite);

export default router;