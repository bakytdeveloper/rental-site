// server/routes/siteRoutes.js
import express from 'express';
import {
    getAllSites,
    getSiteById,
    createSite,
    updateSite,
    deleteSite,
    getFeaturedSites
} from '../controllers/siteController.js';

const router = express.Router();

router.get('/', getAllSites);
router.get('/featured', getFeaturedSites);
router.get('/:id', getSiteById);
router.post('/', createSite);
router.put('/:id', updateSite);
router.delete('/:id', deleteSite);

export default router;