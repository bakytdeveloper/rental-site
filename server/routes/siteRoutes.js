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
    deleteSiteImages,
    toggleFeatured  // Добавляем новый метод
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
router.patch('/:id/featured', toggleFeatured);

export default router;