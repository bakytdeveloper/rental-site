// server/controllers/siteController.js
import Site from '../models/Site.js';
import { uploadMultiple, deleteFile } from '../middleware/uploadMiddleware.js';
import path from 'path';

// @desc    Get all active sites with filtering and pagination
// @route   GET /api/sites
// @access  Public
export const getAllSites = async (req, res) => {
    try {
        console.log('GET /api/sites - Query params:', req.query);

        const { category, featured, page = 1, limit = 12 } = req.query;

        // ВАЖНО: Используем isActive вместо isAvailable
        let query = { isActive: true };

        if (category && category !== 'all') {
            query.category = category;
        }

        if (featured === 'true') {
            query.isFeatured = true;
        }

        const currentPage = parseInt(page);
        const pageLimit = parseInt(limit);

        const sites = await Site.find(query)
            .sort({ sortOrder: -1, createdAt: -1 })
            .limit(pageLimit)
            .skip((currentPage - 1) * pageLimit);

        const total = await Site.countDocuments(query);

        console.log(`Found ${sites.length} sites out of ${total} total`);

        res.json({
            success: true,
            sites,
            totalPages: Math.ceil(total / pageLimit),
            currentPage: currentPage,
            total
        });
    } catch (error) {
        console.error('Error in getAllSites:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при загрузке сайтов',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get all sites (for admin)
// @route   GET /api/sites/admin
// @access  Private/Admin
export const getAllSitesAdmin = async (req, res) => {
    try {
        const sites = await Site.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            sites
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single site by ID
// @route   GET /api/sites/:id
// @access  Public
export const getSiteById = async (req, res) => {
    try {
        const site = await Site.findById(req.params.id);
        if (site) {
            res.json({
                success: true,
                site
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Site not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create a new site with image upload
// @route   POST /api/sites
// @access  Private/Admin
export const createSite = async (req, res) => {
    try {
        uploadMultiple(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            try {
                // Проверяем лимит изображений
                if (req.files && req.files.length > 7) {
                    // Удаляем загруженные файлы если превышен лимит
                    req.files.forEach(file => {
                        deleteFile(file.filename);
                    });
                    return res.status(400).json({
                        success: false,
                        message: 'Maximum 7 images allowed'
                    });
                }

                const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

                // Проверяем, что есть хотя бы одно изображение
                if (imagePaths.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'At least one image is required'
                    });
                }

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
                    isAvailable: req.body.isAvailable === 'true' || req.body.isAvailable === true,
                    sortOrder: parseInt(req.body.sortOrder || 0)
                };

                const site = new Site(siteData);
                const createdSite = await site.save();

                console.log(`✅ Site created with ${imagePaths.length} images`);
                res.status(201).json({
                    success: true,
                    site: createdSite
                });
            } catch (parseError) {
                console.error('Parse error:', parseError);
                // Удаляем загруженные файлы при ошибке парсинга
                if (req.files) {
                    req.files.forEach(file => {
                        deleteFile(file.filename);
                    });
                }
                res.status(400).json({
                    success: false,
                    message: 'Invalid data format: ' + parseError.message
                });
            }
        });
    } catch (error) {
        console.error('Create site error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update a site with image upload
// @route   PUT /api/sites/:id
// @access  Private/Admin
export const updateSite = async (req, res) => {
    try {
        uploadMultiple(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            try {
                const site = await Site.findById(req.params.id);
                if (!site) {
                    // Удаляем загруженные файлы если сайт не найден
                    if (req.files) {
                        req.files.forEach(file => {
                            deleteFile(file.filename);
                        });
                    }
                    return res.status(404).json({
                        success: false,
                        message: 'Site not found'
                    });
                }

                // Обрабатываем новые изображения
                const newImagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

                // Получаем информацию о существующих изображениях из запроса
                let existingImages = [];
                if (req.body.existingImages) {
                    try {
                        existingImages = JSON.parse(req.body.existingImages);
                        console.log('Existing images from request:', existingImages);
                    } catch (parseError) {
                        console.error('Error parsing existingImages:', parseError);
                    }
                }

                // ВАЖНО: Определяем, какие изображения нужно удалить с сервера
                const imagesToDelete = site.images.filter(img => !existingImages.includes(img));

                console.log('Images to delete:', imagesToDelete);

                // Удаляем файлы с сервера
                imagesToDelete.forEach(imageUrl => {
                    const filename = path.basename(imageUrl);
                    deleteFile(filename);
                });

                // Проверяем общий лимит изображений (существующие + новые)
                const totalImages = existingImages.length + newImagePaths.length;

                if (totalImages > 7) {
                    // Удаляем новые файлы если превышен лимит
                    if (req.files) {
                        req.files.forEach(file => {
                            deleteFile(file.filename);
                        });
                    }
                    return res.status(400).json({
                        success: false,
                        message: `Maximum 7 images allowed. You have ${existingImages.length} existing images and tried to add ${newImagePaths.length} new ones.`
                    });
                }

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

                if (req.body.isAvailable !== undefined) {
                    updateData.isAvailable = req.body.isAvailable === 'true' || req.body.isAvailable === true;
                }

                // Преобразуем числовые значения
                if (req.body.price !== undefined) {
                    updateData.price = parseFloat(req.body.price);
                }

                // ВАЖНО: Сохраняем существующие изображения и добавляем новые
                updateData.images = [...existingImages, ...newImagePaths];

                console.log('Final images array:', updateData.images);

                // Обновляем сайт
                const updatedSite = await Site.findByIdAndUpdate(
                    req.params.id,
                    updateData,
                    { new: true, runValidators: true }
                );

                console.log(`✅ Site updated with ${newImagePaths.length} new images, total: ${updatedSite.images.length}`);
                console.log(`🗑️ Deleted ${imagesToDelete.length} old images`);

                res.json({
                    success: true,
                    site: updatedSite
                });
            } catch (parseError) {
                console.error('Parse error in update:', parseError);
                // Удаляем загруженные файлы при ошибке парсинга
                if (req.files) {
                    req.files.forEach(file => {
                        deleteFile(file.filename);
                    });
                }
                res.status(400).json({
                    success: false,
                    message: 'Invalid data format: ' + parseError.message
                });
            }
        });
    } catch (error) {
        console.error('Update site error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete specific images from a site
// @route   DELETE /api/sites/:id/images
// @access  Private/Admin
export const deleteSiteImages = async (req, res) => {
    try {
        const { imageUrls } = req.body;
        const site = await Site.findById(req.params.id);

        if (!site) {
            return res.status(404).json({
                success: false,
                message: 'Site not found'
            });
        }

        if (!imageUrls || !Array.isArray(imageUrls)) {
            return res.status(400).json({
                success: false,
                message: 'Image URLs array is required'
            });
        }

        // Удаляем файлы с сервера
        imageUrls.forEach(imageUrl => {
            const filename = path.basename(imageUrl);
            deleteFile(filename);
        });

        // Обновляем массив изображений сайта
        site.images = site.images.filter(img => !imageUrls.includes(img));
        await site.save();

        console.log(`🗑️ Deleted ${imageUrls.length} images from site`);
        res.json({
            success: true,
            message: 'Images deleted successfully',
            remainingImages: site.images.length
        });
    } catch (error) {
        console.error('Delete images error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete a site and all its images
// @route   DELETE /api/sites/:id
// @access  Private/Admin
export const deleteSite = async (req, res) => {
    try {
        const site = await Site.findById(req.params.id);
        if (site) {
            // Удаляем все изображения сайта с сервера
            if (site.images && site.images.length > 0) {
                site.images.forEach(imageUrl => {
                    const filename = path.basename(imageUrl);
                    deleteFile(filename);
                });
                console.log(`🗑️ Deleted ${site.images.length} images for site`);
            }

            await Site.deleteOne({ _id: req.params.id });

            console.log(`✅ Site deleted: ${site.title}`);

            res.json({
                success: true,
                message: 'Site and all images removed successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Site not found'
            });
        }
    } catch (error) {
        console.error('Delete site error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get featured sites
// @route   GET /api/sites/featured
// @access  Public
export const getFeaturedSites = async (req, res) => {
    try {
        console.log('GET /api/sites/featured');

        const sites = await Site.find({
            isFeatured: true,
            isActive: true
        })
            .sort({ sortOrder: -1, createdAt: -1 })
            .limit(6);

        console.log(`Found ${sites.length} featured sites`);

        // ВАЖНО: Возвращаем объект с полем data для соответствия фронтенду
        res.json({
            success: true,
            data: sites  // Изменено с sites на data для совместимости
        });
    } catch (error) {
        console.error('Error in getFeaturedSites:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Toggle featured status
// @route   PATCH /api/sites/:id/featured
// @access  Private/Admin
export const toggleFeatured = async (req, res) => {
    try {
        const site = await Site.findById(req.params.id);
        if (!site) {
            return res.status(404).json({
                success: false,
                message: 'Site not found'
            });
        }

        site.isFeatured = !site.isFeatured;
        await site.save();

        res.json({
            success: true,
            message: `Site ${site.isFeatured ? 'marked as' : 'unmarked from'} featured`,
            isFeatured: site.isFeatured
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};