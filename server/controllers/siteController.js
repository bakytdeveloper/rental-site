// // server/controllers/siteController.js
// import Site from '../models/Site.js';
// import { uploadMultiple } from '../middleware/uploadMiddleware.js';
//
// // @desc    Get all active sites with filtering and pagination
// // @route   GET /api/sites
// // @access  Public
// export const getAllSites = async (req, res) => {
//     try {
//         const { category, featured, page = 1, limit = 12 } = req.query;
//
//         let query = { isActive: true };
//
//         if (category && category !== 'all') {
//             query.category = category;
//         }
//
//         if (featured === 'true') {
//             query.isFeatured = true;
//         }
//
//         const sites = await Site.find(query)
//             .sort({ sortOrder: -1, createdAt: -1 })
//             .limit(limit * 1)
//             .skip((page - 1) * limit);
//
//         const total = await Site.countDocuments(query);
//
//         res.json({
//             sites,
//             totalPages: Math.ceil(total / limit),
//             currentPage: page,
//             total
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
//
// // @desc    Get single site by ID
// // @route   GET /api/sites/:id
// // @access  Public
// export const getSiteById = async (req, res) => {
//     try {
//         const site = await Site.findById(req.params.id);
//         if (site && site.isActive) {
//             res.json(site);
//         } else {
//             res.status(404).json({ message: 'Site not found' });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
//
// // @desc    Create a new site with image upload
// // @route   POST /api/sites
// // @access  Private/Admin
// export const createSite = async (req, res) => {
//     try {
//         uploadMultiple(req, res, async (err) => {
//             if (err) {
//                 return res.status(400).json({ message: err.message });
//             }
//
//             try {
//                 const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
//
//                 const siteData = {
//                     ...req.body,
//                     images: imagePaths,
//                     technologies: JSON.parse(req.body.technologies || '[]'),
//                     features: JSON.parse(req.body.features || '[]'),
//                     price: parseFloat(req.body.price),
//                     sortOrder: parseInt(req.body.sortOrder || 0)
//                 };
//
//                 const site = new Site(siteData);
//                 const createdSite = await site.save();
//
//                 res.status(201).json(createdSite);
//             } catch (parseError) {
//                 res.status(400).json({ message: parseError.message });
//             }
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
//
// // @desc    Update a site
// // @route   PUT /api/sites/:id
// // @access  Private/Admin
// export const updateSite = async (req, res) => {
//     try {
//         const site = await Site.findById(req.params.id);
//         if (site) {
//             Object.keys(req.body).forEach(key => {
//                 if (key !== 'images') {
//                     site[key] = req.body[key];
//                 }
//             });
//
//             const updatedSite = await site.save();
//             res.json(updatedSite);
//         } else {
//             res.status(404).json({ message: 'Site not found' });
//         }
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };
//
// // @desc    Delete a site
// // @route   DELETE /api/sites/:id
// // @access  Private/Admin
// export const deleteSite = async (req, res) => {
//     try {
//         const site = await Site.findById(req.params.id);
//         if (site) {
//             // Здесь можно добавить удаление файлов изображений
//             await Site.deleteOne({ _id: req.params.id });
//             res.json({ message: 'Site removed successfully' });
//         } else {
//             res.status(404).json({ message: 'Site not found' });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
//
// // @desc    Get featured sites
// // @route   GET /api/sites/featured
// // @access  Public
// export const getFeaturedSites = async (req, res) => {
//     try {
//         const sites = await Site.find({
//             isFeatured: true,
//             isActive: true
//         })
//             .sort({ sortOrder: -1, createdAt: -1 })
//             .limit(6);
//
//         res.json(sites);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };


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

// @desc    Get all sites (for admin)
// @route   GET /api/sites/admin
// @access  Private/Admin
export const getAllSitesAdmin = async (req, res) => {
    try {
        const sites = await Site.find().sort({ createdAt: -1 });
        res.json({ sites });
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
        if (site) {
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

                // Парсим JSON строки в массивы
                const siteData = {
                    ...req.body,
                    images: imagePaths,
                    technologies: typeof req.body.technologies === 'string'
                        ? JSON.parse(req.body.technologies)
                        : req.body.technologies,
                    features: typeof req.body.features === 'string'
                        ? JSON.parse(req.body.features)
                        : req.body.features,
                    price: parseFloat(req.body.price),
                    isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
                    isActive: req.body.isActive === 'true' || req.body.isActive === true,
                    sortOrder: parseInt(req.body.sortOrder || 0)
                };

                const site = new Site(siteData);
                const createdSite = await site.save();

                res.status(201).json(createdSite);
            } catch (parseError) {
                console.error('Parse error:', parseError);
                res.status(400).json({ message: 'Invalid data format: ' + parseError.message });
            }
        });
    } catch (error) {
        console.error('Create site error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a site with image upload
// @route   PUT /api/sites/:id
// @access  Private/Admin
export const updateSite = async (req, res) => {
    try {
        uploadMultiple(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            try {
                const site = await Site.findById(req.params.id);
                if (!site) {
                    return res.status(404).json({ message: 'Site not found' });
                }

                // Обрабатываем новые изображения
                const newImagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

                // Подготавливаем данные для обновления
                const updateData = { ...req.body };

                // Парсим JSON строки если нужно
                if (typeof req.body.technologies === 'string') {
                    updateData.technologies = JSON.parse(req.body.technologies);
                }
                if (typeof req.body.features === 'string') {
                    updateData.features = JSON.parse(req.body.features);
                }

                // Преобразуем булевы значения
                if (req.body.isFeatured !== undefined) {
                    updateData.isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
                }
                if (req.body.isActive !== undefined) {
                    updateData.isActive = req.body.isActive === 'true' || req.body.isActive === true;
                }

                // Преобразуем числовые значения
                if (req.body.price !== undefined) {
                    updateData.price = parseFloat(req.body.price);
                }

                // Если есть новые изображения, добавляем их к существующим
                if (newImagePaths.length > 0) {
                    updateData.images = [...site.images, ...newImagePaths];
                }

                // Обновляем сайт
                const updatedSite = await Site.findByIdAndUpdate(
                    req.params.id,
                    updateData,
                    { new: true, runValidators: true }
                );

                res.json(updatedSite);
            } catch (parseError) {
                console.error('Parse error in update:', parseError);
                res.status(400).json({ message: 'Invalid data format: ' + parseError.message });
            }
        });
    } catch (error) {
        console.error('Update site error:', error);
        res.status(500).json({ message: error.message });
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