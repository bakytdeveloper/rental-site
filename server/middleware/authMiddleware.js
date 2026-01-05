import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Для упрощенного админа
            if (decoded.id === process.env.ADMIN_USERNAME) {
                req.user = {
                    id: decoded.id,
                    role: decoded.role || 'admin'
                };
                return next();
            }

            // Для обычных пользователей из базы данных
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'User account is deactivated'
                });
            }

            req.user = user;
            next();

        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error in authentication'
        });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        // Для упрощенного админа
        if (req.user.id === process.env.ADMIN_USERNAME) {
            return next();
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

// Middleware только для клиентов
export const clientOnly = (req, res, next) => {
    if (req.user.role !== 'client') {
        return res.status(403).json({
            success: false,
            message: 'This route is for clients only'
        });
    }
    next();
};

// Middleware для проверки владения контактом
export const checkContactOwnership = async (req, res, next) => {
    try {
        const contactId = req.params.contactId || req.body.contactId;

        if (!contactId) {
            return next();
        }

        const contact = await Contact.findById(contactId);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        // Проверяем, принадлежит ли контакт пользователю
        if (contact.userId && contact.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access this contact'
            });
        }

        req.contact = contact;
        next();

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking contact ownership'
        });
    }
};