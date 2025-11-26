// server/controllers/siteController.js
import Site from '../models/Site.js';
import { uploadMultiple } from '../middleware/uploadMiddleware.js';

// @desc    Get all active sites with filtering and pagination
// @route   GET /api/sites
// @access  Public
export const getAllSites = async (req, res) => {
    try {
        const { category, featured, page = 1, limit = 12 } = req.query;

        let query = { isActive: true };

        if (category && category !== 'all') {
            query.category = category;
        }

        if (featured === 'true') {
            query.isFeatured = true;
        }

        const sites = await Site.find(query)
            .sort({ sortOrder: -1, createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Site.countDocuments(query);

        res.json({
            sites,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single site by ID
// @route   GET /api/sites/:id
// @access  Public
export const getSiteById = async (req, res) => {
    try {
        const site = await Site.findById(req.params.id);
        if (site && site.isActive) {
            res.json(site);
        } else {
            res.status(404).json({ message: 'Site not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new site with image upload
// @route   POST /api/sites
// @access  Private/Admin
export const createSite = async (req, res) => {
    try {
        uploadMultiple(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            try {
                const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

                const siteData = {
                    ...req.body,
                    images: imagePaths,
                    technologies: JSON.parse(req.body.technologies || '[]'),
                    features: JSON.parse(req.body.features || '[]'),
                    price: parseFloat(req.body.price),
                    sortOrder: parseInt(req.body.sortOrder || 0)
                };

                const site = new Site(siteData);
                const createdSite = await site.save();

                res.status(201).json(createdSite);
            } catch (parseError) {
                res.status(400).json({ message: parseError.message });
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a site
// @route   PUT /api/sites/:id
// @access  Private/Admin
export const updateSite = async (req, res) => {
    try {
        const site = await Site.findById(req.params.id);
        if (site) {
            Object.keys(req.body).forEach(key => {
                if (key !== 'images') {
                    site[key] = req.body[key];
                }
            });

            const updatedSite = await site.save();
            res.json(updatedSite);
        } else {
            res.status(404).json({ message: 'Site not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a site
// @route   DELETE /api/sites/:id
// @access  Private/Admin
export const deleteSite = async (req, res) => {
    try {
        const site = await Site.findById(req.params.id);
        if (site) {
            // Здесь можно добавить удаление файлов изображений
            await Site.deleteOne({ _id: req.params.id });
            res.json({ message: 'Site removed successfully' });
        } else {
            res.status(404).json({ message: 'Site not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get featured sites
// @route   GET /api/sites/featured
// @access  Public
export const getFeaturedSites = async (req, res) => {
    try {
        const sites = await Site.find({
            isFeatured: true,
            isActive: true
        })
            .sort({ sortOrder: -1, createdAt: -1 })
            .limit(6);

        res.json(sites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};