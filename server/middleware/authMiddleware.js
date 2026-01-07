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
                message: 'Не авторизован для доступа к этому маршруту'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Проверяем, админ ли это
            if (decoded.id === process.env.ADMIN_USERNAME) {
                req.user = {
                    id: decoded.id,
                    username: process.env.ADMIN_USERNAME,
                    email: process.env.ADMIN_EMAIL,
                    role: 'admin'
                };
                return next();
            }

            // Проверяем пользователя из базы данных
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Пользователь не найден'
                });
            }

            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Аккаунт деактивирован'
                });
            }

            req.user = user;
            next();

        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Не авторизован'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при аутентификации'
        });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        // Разрешаем доступ админу из .env
        if (req.user.id === process.env.ADMIN_USERNAME) {
            return next();
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Роль ${req.user.role} не авторизована для доступа`
            });
        }
        next();
    };
};

// Только для клиентов
export const clientOnly = (req, res, next) => {
    if (req.user.role !== 'client') {
        return res.status(403).json({
            success: false,
            message: 'Этот маршрут только для клиентов'
        });
    }
    next();
};

// Только для админа
export const adminOnly = (req, res, next) => {
    if (req.user.id !== process.env.ADMIN_USERNAME) {
        return res.status(403).json({
            success: false,
            message: 'Этот маршрут только для администратора'
        });
    }
    next();
};